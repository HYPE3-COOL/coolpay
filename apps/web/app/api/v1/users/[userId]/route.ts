import '@/app/polyfills';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema/user';

import { CoolPayService } from '@/services/coolpay.service';

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const id = BigInt(params.userId)
    if (isNaN(Number(id))) return new Response('Invalid User ID', { status: 400 });

    const body = await request.json();
    const updatedUser = await db
      .update(user)
      .set(body)
      .where(eq(user.id, id)) // Ensure types match
      .returning();

    return Response.json({ data: updatedUser });
  } catch (error) {
    console.error('Failed to update user:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const id = BigInt(params.userId)
    if (isNaN(Number(id))) return new Response('Invalid User ID', { status: 400 });

    const deletedUser = await db
      .delete(user)
      .where(eq(user.id, id)) // Ensure types match
      .returning();

    return Response.json({ data: deletedUser });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const id = BigInt(params.userId);
    if (isNaN(Number(id))) return new Response('Invalid User ID', { status: 400 });

    // const user = await db
    //   .select()
    //   .from(user)
    //   .where(eq(user.id, id));
    const user = await CoolPayService.getUserById(id);

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    const activities = await CoolPayService.getActivities({
      user_id: user.id,
    })

    // const requests = activities.length;
    // const responses = activities.filter(s => (s.response_count ?? 0) > 0).length;
    // const responseRate = requests > 0 ? responses / requests : 0;
    // const totalAmount = activities.reduce((sum, s) => sum + (typeof s.amount === 'bigint' ? Number(s.amount) : (s.amount ? parseFloat(s.amount) : 0)), 0);
    // const avgCost = requests > 0 ? totalAmount / requests : 0;

    return Response.json({
      data: user,
      // data: {
      //   ...user,
      //   requests,
      //   responseRate,
      //   avgCost,
      // }
    });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}