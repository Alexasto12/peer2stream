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
    return NextResponse.json({ error: 'Token and new password required' }, { status: 400 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Verificar que el hash de la contraseña actual coincide con el del token
  if (user.password !== decoded.passwordHash) {
    return NextResponse.json({ error: 'This reset link has already been used or is no longer valid.' }, { status: 400 });
  }

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  return NextResponse.json({ message: 'Password updated successfully' });
}
