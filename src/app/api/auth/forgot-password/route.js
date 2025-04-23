import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;
const RESET_TOKEN_EXPIRATION = '1h'; // 1 hora

export async function POST(req) {
  await connectToDatabase();
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Por seguridad, no revelar si el email existe o no
    return NextResponse.json({ message: 'Si el email existe, se ha enviado un enlace de recuperación' });
  }

  // Generar token JWT con expiración corta
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: RESET_TOKEN_EXPIRATION });
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  // Aquí deberías enviar el email con resetUrl. Por ahora, solo lo devolvemos para pruebas.
  return NextResponse.json({ message: 'Enlace de recuperación generado', resetUrl });
}
