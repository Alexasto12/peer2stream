import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import ContentStatus from '@/models/Content_status';
import { connectToDatabase } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

// GET: Obtener un registro específico
export async function GET(request, { params }) {
    await connectToDatabase();
    const getCookie = await cookies();
    const token = getCookie.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    const { externalId } = params;
    const contentStatus = await ContentStatus.findOne({ userId: decoded.id, externalId });
    if (!contentStatus) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(contentStatus);
}

// PATCH: Actualizar un registro específico
export async function PATCH(request, { params }) {
    await connectToDatabase();
    const patchCookie = await cookies();
    const token = patchCookie.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    const { externalId } = params;
    const body = await request.json();
    const update = { ...body };
    // Si el status se cambia a 'watched', watchedTime debe ser 0
    if (update.status === 'watched') {
        update.watchedTime = 0;
    }
    const updated = await ContentStatus.findOneAndUpdate(
        { userId: decoded.id, externalId },
        update,
        { new: true }
    );
    if (!updated) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(updated);
}

// DELETE: Eliminar un registro específico
export async function DELETE(request, { params }) {
    await connectToDatabase();
    const deleteCookie = await cookies();
    const token = deleteCookie.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    const { externalId } = params;
    const deleted = await ContentStatus.findOneAndDelete({ userId: decoded.id, externalId });
    if (!deleted) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ success: true });
}
