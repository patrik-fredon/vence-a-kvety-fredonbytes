import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/config';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/contact-forms/[id]/status - Update contact form status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // TODO: Add admin role check when user roles are implemented
    // For now, any authenticated user can update contact form status

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON body',
        },
        { status: 400 }
      );
    }

    const { status } = body;

    // Validate status
    const validStatuses = ['new', 'read', 'replied', 'archived'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid status. Must be one of: ' + validStatuses.join(', '),
        },
        { status: 400 }
      );
    }

    // Update contact form status
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('contact_forms')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contact form status:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update contact form status',
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: 'Contact form not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact form status updated successfully',
      data,
    });

  } catch (error) {
    console.error('Contact form status update API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
