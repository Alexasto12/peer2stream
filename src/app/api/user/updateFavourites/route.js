import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb'; // Note: importing as named export
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
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
    const add = Array.isArray(body.add) ? body.add : [];
    const remove = Array.isArray(body.remove) ? body.remove : [];
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    // Asegurar estructura correcta
    if (!user.favourites || !Array.isArray(user.favourites.content)) {
      user.favourites = { content: [] };
    }
    let content = user.favourites.content;
    // Añadir elementos (evitar duplicados por external_id)
    add.forEach(item => {
      if (!content.some(fav => fav.external_id === item.external_id)) {
        content.push(item);
      }
    });
    // Eliminar elementos por external_id
    const removeIds = remove.map(item => item.external_id);
    content = content.filter(fav => !removeIds.includes(fav.external_id));
    user.favourites.content = content;
    await user.save();
    return NextResponse.json({ message: 'Favourites actualizados', favourites: user.favourites });
  } catch (error) {
    console.error('❌ Registro error completo:', error);
    return NextResponse.json({
      error: error.message || 'Error en el servidor',
      raw: JSON.stringify(error),
    }, { status: 500 });
  }
}
