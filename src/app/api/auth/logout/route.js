import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
    const cookie = serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        expires: new Date(0), // Fuerza expiración inmediata
    });

    const res = NextResponse.json({ message: 'Logout exitoso' });
    res.headers.set('Set-Cookie', cookie);
    return res;
}
