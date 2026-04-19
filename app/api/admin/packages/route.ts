import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/check-admin';
import { createAdminClient } from '@/lib/supabase/server';

// GET - List all packages for admin
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = await createAdminClient();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query = supabase
      .from('packages')
      .select(`
        *,
        package_questions (count)
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Transform to include question count
    const packages = (data || []).map((pkg: any) => ({
      ...pkg,
      question_count: pkg.package_questions[0]?.count || 0,
    }));

    return NextResponse.json({ packages });
  } catch (error: any) {
    console.error('Get packages error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}

// POST - Create new package
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAdmin();
    const supabase = await createAdminClient();
    const body = await request.json();

    const { title, description, difficulty, tier, duration_minutes, is_active } = body;

    // Validate required fields
    if (!title || !difficulty || !tier) {
      return NextResponse.json(
        { error: 'Title, difficulty, and tier are required' },
        { status: 400 }
      );
    }

    // Insert package
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .insert({
        title,
        description: description || null,
        difficulty,
        tier,
        duration_minutes: duration_minutes || 100,
        is_active: is_active ?? true,
        created_by: userId,
      })
      .select()
      .single();

    if (pkgError) throw pkgError;

    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch (error: any) {
    console.error('Create package error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create package' },
      { status: 500 }
    );
  }
}