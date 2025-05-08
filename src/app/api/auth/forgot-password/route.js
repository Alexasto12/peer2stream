import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET;
const RESET_TOKEN_EXPIRATION = '1h'; // 1 hora

export async function POST(req) {
  await connectToDatabase();
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const user = await User.findOne({ email });
  if (!user) {
    // For security, do not reveal if the email exists or not
    return NextResponse.json({ message: 'If the email exists, a recovery link has been sent' });
  }

  // Generar token JWT con expiración corta
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: RESET_TOKEN_EXPIRATION });
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  // Configurar el transporte SMTP con nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465,
    secure: true, // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER, // tu email
      pass: process.env.SMTP_PASS, // tu contraseña o app password
    },
  });

  // Opciones del email
  const mailOptions = {
    from: `"Peer2Stream" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Recuperación de contraseña',
    html: `<p>Hola,</p><p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Si no solicitaste este cambio, ignora este correo.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    return NextResponse.json({ error: 'Error enviando el email de recuperación' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Si el email existe, se ha enviado un enlace de recuperación' });
}
