import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import ContentStatus from '@/models/Content_status';
import { connectToDatabase } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

// GET: Obtener todos los registros del usuario autenticado
export async function GET() {
    await connectToDatabase();
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    const status = await ContentStatus.find({ userId: decoded.id });
    return NextResponse.json(status);
}

// POST: Crear un nuevo registro
export async function POST(req) {
    await connectToDatabase();
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    const data = await req.json();
    data.userId = decoded.id;
    try {
        const nuevo = new ContentStatus(data);
        await nuevo.save();
        return NextResponse.json(nuevo, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
