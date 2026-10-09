import { NextRequest, NextResponse } from 'next/server';
import { PATCH as updateBooking } from '../route';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return updateBooking(req, context);
}
