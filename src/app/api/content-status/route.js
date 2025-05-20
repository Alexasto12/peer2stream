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
    console.log('[POST] content-status endpoint called');
    
    await connectToDatabase();
    console.log('[POST] Database connected');
    
    const postCookie = await cookies();
    const token = postCookie.get('token')?.value;
    if (!token) {
        console.log('[POST] No authentication token found');
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
        console.log('[POST] Token decoded, user ID:', decoded.id);
    } catch (tokenError) {
        console.log('[POST] Token validation failed:', tokenError.message);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const data = await req.json();
    console.log('[POST] Request data:', JSON.stringify(data));
    
    data.userId = decoded.id;
    try {
        // Ensure all required fields are present
        if (!data.externalId) {
            console.log('[POST] Missing externalId');
            return NextResponse.json({ error: 'externalId is required' }, { status: 400 });
        }
        if (!data.type) {
            console.log('[POST] Missing type');
            return NextResponse.json({ error: 'type is required' }, { status: 400 });
        }
        if (!data.status) {
            console.log('[POST] Missing status');
            return NextResponse.json({ error: 'status is required' }, { status: 400 });
        }
        if (data.watchedTime === undefined) {
            console.log('[POST] Missing watchedTime');
            return NextResponse.json({ error: 'watchedTime is required' }, { status: 400 });
        }
        if (!data.lastWatched) {
            data.lastWatched = new Date().toISOString();
            console.log('[POST] Setting lastWatched to current date');
        }
        
        const nuevo = new ContentStatus(data);
        await nuevo.save();
        console.log('[POST] Content status created successfully');
        return NextResponse.json(nuevo, { status: 201 });
    } catch (err) {
        console.error('[POST] Error creating content status:', err);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
