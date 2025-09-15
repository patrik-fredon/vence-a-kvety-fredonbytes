import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ errorId: string }> }
) {
  try {
    const { errorId } = await params;
    const { resolved, resolution_notes } = await request.json();

    const supabase = createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update error resolution status
    const { error: dbError } = await supabase
      .from('error_logs')
      .update({
        resolved: resolved,
        resolved_at: resolved ? new Date().toISOString() : null,
        resolved_by: resolved ? user.id : null,
        resolution_notes: resolution_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('error_id', errorId);

    if (dbError) {
      console.error('Failed to update error resolution:', dbError);
      return NextResponse.json(
        { error: 'Failed to update error resolution' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resolved ? 'Error marked as resolved' : 'Error marked as unresolved'
    });

  } catch (error) {
    console.error('Error in error resolution endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
