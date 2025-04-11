import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, password } = body;

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Crear cookie httpOnly, necesita Endpoint
    // para que el navegador no la pueda leer
    // y no se pueda modificar desde el cliente
    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 día
    });

    const res = NextResponse.json({ message: 'Login exitoso' });
    res.headers.set('Set-Cookie', cookie);
    return res;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
