import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import ContentStatus from '@/models/Content_status';
import { connectToDatabase } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

// Verificar si un objeto externalId es válido
const isValidExternalId = (id) => {
    // Comprueba si el ID es una cadena no vacía
    return typeof id === 'string' && id.trim().length > 0;
};

// GET: Obtener un registro específico
export async function GET(request, context) {
    console.log('[GET] content-status endpoint called');
    
    await connectToDatabase();
    console.log('[GET] Database connected');
    
    const getCookie = await cookies();
    const token = getCookie.get('token')?.value;
    if (!token) {
        console.log('[GET] No authentication token found');
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
        console.log('[GET] Token decoded, user ID:', decoded.id);
    } catch (tokenError) {
        console.log('[GET] Token validation failed:', tokenError.message);
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });    
    }
      // Get params with await to fix "params should be awaited" error
    const params = await context.params;
    const externalId = params.externalId;
    console.log('[GET] externalId from params:', externalId);
    
    // Validate the externalId
    if (!isValidExternalId(externalId)) {
        console.log('[GET] Invalid externalId format');
        return NextResponse.json({ error: 'Invalid externalId format' }, { status: 400 });
    }
    
    try {
        const contentStatus = await ContentStatus.findOne({ userId: decoded.id, externalId });
        if (!contentStatus) {
            console.log('[GET] No content status found');
            return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
        }
        
        console.log('[GET] Content status found:', JSON.stringify(contentStatus));
        return NextResponse.json(contentStatus);
    } catch (error) {
        console.error('[GET] Error fetching content status:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Actualizar un registro específico
export async function PATCH(request, context) {
    console.log('[PATCH] content-status endpoint called');
    
    await connectToDatabase();
    console.log('[PATCH] Database connected');
    
    const patchCookie = await cookies();
    const token = patchCookie.get('token')?.value;
    if (!token) {
        console.log('[PATCH] No authentication token found');
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
        console.log('[PATCH] Token decoded, user ID:', decoded.id);
    } catch (tokenError) {
        console.log('[PATCH] Token validation failed:', tokenError.message);
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });    
    }
      // Get params with await to fix "params should be awaited" error
    const params = await context.params;
    const externalId = params.externalId;
    console.log('[PATCH] externalId from params:', externalId);
    
    // Validate the externalId
    if (!isValidExternalId(externalId)) {
        console.log('[PATCH] Invalid externalId format');
        return NextResponse.json({ error: 'Invalid externalId format' }, { status: 400 });
    }const body = await request.json();
    console.log('[PATCH] Request body:', JSON.stringify(body));
    
    const update = { ...body };
    // Si el status se cambia a 'watched', watchedTime debe ser 0
    if (update.status === 'watched') {
        update.watchedTime = 0;
    }
    
    try {
        // Ensure all required fields are present - important for upsert
        if (!update.type) {
            console.log('[PATCH] Missing type in request body, using default "movie"');
            update.type = 'movie';
        }
        
        if (!update.status) {
            console.log('[PATCH] Missing status in request body, using default "pending"');
            update.status = 'pending';
        }
        
        if (update.watchedTime === undefined) {
            console.log('[PATCH] Missing watchedTime in request body, using default 0');
            update.watchedTime = 0;
        }
        
        if (!update.lastWatched) {
            console.log('[PATCH] Missing lastWatched in request body, using current date');
            update.lastWatched = new Date().toISOString();
        }
        
        console.log('[PATCH] Attempting findOneAndUpdate with upsert');
        
        // Intentar actualizar un registro existente o crear uno nuevo (upsert)
        const updated = await ContentStatus.findOneAndUpdate(
            { userId: decoded.id, externalId },
            update,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        
        console.log('[PATCH] Update successful, returning:', JSON.stringify(updated));
        return NextResponse.json(updated);
    } catch (error) {
        console.error('[PATCH] Error updating content status:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Eliminar un registro específico
export async function DELETE(request, context) {
    console.log('[DELETE] content-status endpoint called');
    
    await connectToDatabase();
    console.log('[DELETE] Database connected');
    
    const deleteCookie = await cookies();
    const token = deleteCookie.get('token')?.value;
    if (!token) {
        console.log('[DELETE] No authentication token found');
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
        console.log('[DELETE] Token decoded, user ID:', decoded.id);    
    } catch (tokenError) {
        console.log('[DELETE] Token validation failed:', tokenError.message);
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });    
    }    // Get params with await to fix "params should be awaited" error
    const params = await context.params;
    const externalId = params.externalId;
    console.log('[DELETE] externalId from params:', externalId);
    
    // Validate the externalId
    if (!isValidExternalId(externalId)) {
        console.log('[DELETE] Invalid externalId format');
        return NextResponse.json({ error: 'Invalid externalId format' }, { status: 400 });
    }
    
    const deleted = await ContentStatus.findOneAndDelete({ userId: decoded.id, externalId });
    if (!deleted) {
        console.log('[DELETE] No record found for deletion');
        return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }
    
    console.log('[DELETE] Content status successfully deleted');
    return NextResponse.json({ success: true });
}
