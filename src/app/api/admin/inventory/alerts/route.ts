import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/auth/admin-middleware';
import { adminUtils } from '@/lib/supabase/utils';

/**
 * Get inventory alerts (Admin only)
 */
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const acknowledged = searchParams.get('acknowledged') === 'true';

    const { data: alerts, error } = await adminUtils.getInventoryAlerts(acknowledged);

    if (error) {
      console.error('Error fetching inventory alerts:', error);
      return NextResponse.json({
        success: false,
        error: 'Chyba při načítání upozornění'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      alerts: alerts || []
    });

  } catch (error) {
    console.error('Error in GET /api/admin/inventory/alerts:', error);
    return NextResponse.json({
      success: false,
      error: 'Interní chyba serveru'
    }, { status: 500 });
  }
});
