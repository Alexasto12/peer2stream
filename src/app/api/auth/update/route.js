import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
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

  // No permitir actualizar el email
  if ('email' in body) {
    return NextResponse.json({ error: 'No se permite actualizar el email' }, { status: 400 });
  }

  // Si se actualiza username, comprobar que no exista otro igual
  if (body.username) {
    const existing = await User.findOne({ username: body.username, _id: { $ne: userId } });
    if (existing) {
      return NextResponse.json({ error: 'El nombre de usuario ya está en uso' }, { status: 400 });
    }
  }

  // Si se actualiza password, hashearla
  if (body.password) {
    body.password = await bcrypt.hash(body.password, 10);
  }

  // Actualizar usuario
  const updatedUser = await User.findByIdAndUpdate(userId, body, { new: true, runValidators: true, fields: '-password' });
  if (!updatedUser) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Usuario actualizado', user: updatedUser });
}
