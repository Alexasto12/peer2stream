import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

export async function PATCH(req) {
  await connectToDatabase();
  const token = cookies().get('token')?.value;
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
  const body = await req.json();

  // Solo permitir modificar settings
  const update = {};
  if (body.settings) {
    update['settings'] = { ...body.settings };
  }
  if (typeof body.notifications === 'boolean') {
    update['settings.notifications'] = body.notifications;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No hay datos para actualizar' }, { status: 400 });
  }

  const user = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true, fields: 'settings' });
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Settings actualizados', settings: user.settings });
}
