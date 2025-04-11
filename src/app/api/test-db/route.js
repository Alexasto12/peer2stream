import { NextResponse } from 'next/server';
import db from '@/lib/mongodb';

export async function GET() {
  try {
    await db;
    return NextResponse.json({ message: 'MongoDB connected OK' });
  } catch (error) {
    return NextResponse.json({ error: 'MongoDB connection failed' }, { status: 500 });
  }
}
