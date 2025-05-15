import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  await connectToDatabase();
  const tokenStore = await cookies();
  const token = tokenStore.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }  const userId = decoded.id;
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (!user.settings?.notifications) {
    return NextResponse.json({ error: 'Notifications are disabled' }, { status: 403 });
  }
  const { message } = await req.json();
  if (!message || message.length > 255) {
    return NextResponse.json({ error: 'Message required and maximum 255 characters' }, { status: 400 });
  }
  if (!Array.isArray(user.notifications)) {
    user.notifications = [];
  }  user.notifications.push({ message });
  await user.save();
  return NextResponse.json({ message: 'Notification added', notifications: user.notifications });
}

export async function GET() {
  await connectToDatabase();
  const tokenStore = await cookies();
  const token = tokenStore.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }  const userId = decoded.id;
  const user = await User.findById(userId, 'notifications settings');
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (!user.settings?.notifications) {
    return NextResponse.json({ error: 'Notifications are disabled' }, { status: 403 });
  }
  return NextResponse.json({ notifications: user.notifications || [] });
}

export async function DELETE(req) {
  await connectToDatabase();
  const tokenStore = await cookies();
  const token = tokenStore.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }  const userId = decoded.id;
  const data = await req.json();
  const { _id } = data;
  
  if (!_id) {
    return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
  }
  
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (!user.settings?.notifications) {
    return NextResponse.json({ error: 'Notifications are disabled' }, { status: 403 });
  }
  
  // Soporta tanto un solo ID como un array de IDs
  if (Array.isArray(_id)) {    // Delete multiple notifications at once
    const idsToRemove = _id.map(id => id.toString());
    user.notifications = user.notifications.filter(n => !idsToRemove.includes(n._id.toString()));
    await user.save();
    return NextResponse.json({ 
      message: `${idsToRemove.length} notifications deleted`, 
      notifications: user.notifications 
    });
  } else {    // Delete a single notification (original behavior)
    user.notifications = user.notifications.filter(n => n._id.toString() !== _id);
    await user.save();
    return NextResponse.json({ 
      message: 'Notification deleted', 
      notifications: user.notifications 
    });
  }
}
