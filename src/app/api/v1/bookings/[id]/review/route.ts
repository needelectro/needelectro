import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session || session.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Only customers can review completed services' },
        { status: 403 }
      );
    }

    const customer = await prisma.customerProfile.findUnique({
      where: { userId: session.id },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { reviews: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.customerId !== customer.id) {
      return NextResponse.json(
        { error: 'You can only review your own service bookings' },
        { status: 403 }
      );
    }

    // Must be strictly completed or paid or closed
    const validStatuses = ['COMPLETED', 'PAID', 'CLOSED', 'WORK_COMPLETED'];
    if (!validStatuses.includes(booking.status)) {
      return NextResponse.json(
        { error: 'Reviews can only be submitted for completed service bookings' },
        { status: 400 }
      );
    }

    // Check if already reviewed
    if (booking.reviews && booking.reviews.length > 0) {
      return NextResponse.json(
        { error: 'You have already submitted a review for this booking' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      rating = 5,
      comment = '',
      ratingProfessionalism = 5,
      ratingQuality = 5,
      ratingPunctuality = 5,
      ratingBehavior = 5,
    } = body;

    const numRating = Math.min(5, Math.max(1, Number(rating) || 5));

    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          customerId: customer.id,
          bookingId: booking.id,
          technicianId: booking.technicianId || null,
          rating: numRating,
          ratingProfessionalism: Number(ratingProfessionalism) || 5,
          ratingQuality: Number(ratingQuality) || 5,
          ratingPunctuality: Number(ratingPunctuality) || 5,
          ratingBehavior: Number(ratingBehavior) || 5,
          comment: comment.trim() || 'Work completed satisfactorily.',
          isApproved: true,
        },
      });

      // Recalculate technician rating if technician assigned
      if (booking.technicianId) {
        const allTechReviews = await tx.review.findMany({
          where: { technicianId: booking.technicianId, isApproved: true },
          select: { rating: true },
        });

        const totalReviews = allTechReviews.length;
        const avgRating =
          totalReviews > 0
            ? allTechReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 5.0;

        await tx.technicianProfile.update({
          where: { id: booking.technicianId },
          data: {
            ratingOverall: Math.round(avgRating * 10) / 10,
            totalReviews,
          },
        });
      }

      return review;
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your review has been published.',
      review: result,
    });
  } catch (error: any) {
    console.error('Submit booking review error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit review' }, { status: 500 });
  }
}
