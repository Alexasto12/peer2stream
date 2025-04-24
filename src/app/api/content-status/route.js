import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import ContentStatus from '@/models/Content_status';
import { connectToDatabase } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

async function getUserIdFromToken() {
    const tokenStore = await cookies();
    const token = tokenStore.get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.id;
    } catch {
        return null;
    }
}

export async function GET(req) {
    await connectToDatabase();
    const userId = await getUserIdFromToken();
    if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    let externalId;
    try {
        const body = await req.json();
        externalId = body.externalId;
    } catch {
        externalId = undefined;
    }
    const query = { userId };
    if (externalId) query.externalId = externalId;
    const status = await ContentStatus.find(query);
    return NextResponse.json(status);
}

export async function POST(req) {
    await connectToDatabase();
    const userId = await getUserIdFromToken();
    if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const data = await req.json();
    data.userId = userId;
    try {
        const nuevo = new ContentStatus(data);
        await nuevo.save();
        return NextResponse.json(nuevo, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

export async function PATCH(req) {
    await connectToDatabase();
    const userId = await getUserIdFromToken();
    if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const data = await req.json();
    if (!data.externalId) return NextResponse.json({ error: 'externalId requerido' }, { status: 400 });
    // Si el status cambia a 'watched', poner watchedTime a 0
    if (data.status === 'watched') {
        data.watchedTime = 0;
    }
    try {
        const updated = await ContentStatus.findOneAndUpdate(
            { userId, externalId: data.externalId },
            data,
            { new: true }
        );
        if (!updated) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
        return NextResponse.json(updated);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

export async function DELETE(req) {
    await connectToDatabase();
    const userId = await getUserIdFromToken();
    if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const { externalId } = await req.json();
    if (!externalId) return NextResponse.json({ error: 'externalId requerido' }, { status: 400 });
    const deleted = await ContentStatus.findOneAndDelete({ userId, externalId });
    if (!deleted) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ message: 'Eliminado correctamente' });
}
