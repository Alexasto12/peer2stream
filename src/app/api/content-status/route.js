import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import ContentStatus from '@/models/Content_status';
import { connectToDatabase } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

// GET: Obtener todos los registros del usuario autenticado
export async function GET() {
    await connectToDatabase();
    const getCookie = await cookies();
    const token = getCookie.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const status = await ContentStatus.find({ userId: decoded.id });
    return NextResponse.json(status);
}

// POST: Crear un nuevo registro
export async function POST(req) {
    await connectToDatabase();
    const postCookie = await cookies();
    const token = postCookie.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
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
