import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ message: 'MongoDB connected OK' });
  } catch (error) {
    console.error('DB Test Error:', error.message);
    return NextResponse.json({ 
      error: 'MongoDB connection failed', 
      details: error.message 
    }, { status: 500 });
  }
}
