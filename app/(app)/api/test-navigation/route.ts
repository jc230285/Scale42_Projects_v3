import { getNavigationSections } from '../../../../lib/navigation';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[API] Testing navigation loading...');
    const sections = await getNavigationSections();
    console.log('[API] Navigation loaded:', sections?.length || 0, 'sections');

    return NextResponse.json({
      success: true,
      sectionsCount: sections?.length || 0,
      sections: sections
    });
  } catch (error) {
    console.error('[API] Navigation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}