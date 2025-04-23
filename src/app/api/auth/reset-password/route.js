import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  await connectToDatabase();
  const { token, password } = await req.json();
  if (!token || !password) {
    return NextResponse.json({ error: 'Token y nueva contraseña requeridos' }, { status: 400 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  return NextResponse.json({ message: 'Contraseña actualizada correctamente' });
}
