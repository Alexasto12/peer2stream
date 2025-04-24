import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

export async function PATCH(req) {
  await connectToDatabase();
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
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

  // Validar que no se pueda enviar oldPassword sin password nuevo
  if (body.oldPassword && !body.password) {
    return NextResponse.json({ error: 'Debes proporcionar una nueva contraseña junto con la contraseña actual' }, { status: 400 });
  }
  // Solo permitir username y password
  const allowedFields = ['username', 'password', 'oldPassword'];
  for (const key of Object.keys(body)) {
    if (!allowedFields.includes(key)) {
      return NextResponse.json({ error: 'Solo se puede actualizar username o password' }, { status: 400 });
    }
  }

  // Si se actualiza username, comprobar que no exista otro igual
  if (body.username) {
    const existing = await User.findOne({ username: body.username, _id: { $ne: userId } });
    if (existing) {
      return NextResponse.json({ error: 'El nombre de usuario ya está en uso' }, { status: 400 });
    }
  }

  // Si se actualiza password, comprobar oldPassword y que no sea igual
  if (body.password) {
    if (!body.oldPassword) {
      return NextResponse.json({ error: 'Debes proporcionar la contraseña actual' }, { status: 400 });
    }
    const user = await User.findById(userId).select('+password');
    const isMatch = await bcrypt.compare(body.oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 });
    }
    const isSame = await bcrypt.compare(body.password, user.password);
    if (isSame) {
      return NextResponse.json({ error: 'La nueva contraseña no puede ser igual a la anterior' }, { status: 400 });
    }
    body.password = await bcrypt.hash(body.password, 10);
    delete body.oldPassword;
  }

  // Actualizar usuario
  const updateFields = {};
  if (body.username) updateFields.username = body.username;
  if (body.password) updateFields.password = body.password;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateFields,
    { new: true, runValidators: true, fields: '-password' }
  );
  if (!updatedUser) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Usuario actualizado', user: updatedUser });
}
