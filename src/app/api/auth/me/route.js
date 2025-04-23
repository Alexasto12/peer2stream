
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  const token = req.cookies.token; // Obtener el token de la cookie
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.json({ user: decoded });
  } catch (error) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}
