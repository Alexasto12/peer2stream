import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  await connectToDatabase();
  const tokenStore = await cookies();
  const token = tokenStore.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
  const userId = decoded.id;
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  if (!user.settings?.notifications) {
    return NextResponse.json({ error: 'Las notificaciones están desactivadas' }, { status: 403 });
  }
  const { message } = await req.json();
  if (!message || message.length > 255) {
    return NextResponse.json({ error: 'Mensaje requerido y máximo 255 caracteres' }, { status: 400 });
  }
  if (!Array.isArray(user.notifications)) {
    user.notifications = [];
  }
  user.notifications.push({ message });
  await user.save();
  return NextResponse.json({ message: 'Notificación añadida', notifications: user.notifications });
}

export async function GET() {
  await connectToDatabase();
  const tokenStore = await cookies();
  const token = tokenStore.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
  const userId = decoded.id;
  const user = await User.findById(userId, 'notifications settings');
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  if (!user.settings?.notifications) {
    return NextResponse.json({ error: 'Las notificaciones están desactivadas' }, { status: 403 });
  }
  return NextResponse.json({ notifications: user.notifications || [] });
}

export async function DELETE(req) {
  await connectToDatabase();
  const tokenStore = await cookies();
  const token = tokenStore.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
  const userId = decoded.id;
  const { _id } = await req.json();
  if (!_id) {
    return NextResponse.json({ error: 'ID de notificación requerido' }, { status: 400 });
  }
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  if (!user.settings?.notifications) {
    return NextResponse.json({ error: 'Las notificaciones están desactivadas' }, { status: 403 });
  }
  user.notifications = user.notifications.filter(n => n._id.toString() !== _id);
  await user.save();
  return NextResponse.json({ message: 'Notificación eliminada', notifications: user.notifications });
}
