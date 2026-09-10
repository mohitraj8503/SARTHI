import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, handleApiError } from '@/lib/admin/core';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const FILE_PATH = path.join(process.cwd(), 'public', 'custom_certificate_templates.json');

const systemTemplates = [
  {
    id: 'tmpl_ai43',
    name: 'AI Glassmorphism',
    bgImage: '/certificate-bg.png',
    courseId: 'ALL',
    isSystem: true
  },
  {
    id: 'tmpl_excel43',
    name: 'Advance Excel',
    bgImage: '/excel-bg.jpg',
    courseId: 'ALL',
    isSystem: true
  },
  {
    id: 'tmpl_python43',
    name: 'Python Masterclass',
    bgImage: '/python-bg.jpg',
    courseId: 'ALL',
    isSystem: true
  }
];

function getSavedTemplates(): any[] {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed reading custom templates file:', e);
  }
  return [];
}

function saveTemplates(templates: any[]) {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FILE_PATH, JSON.stringify(templates, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed writing custom templates file:', e);
  }
}

/**
 * GET: List all custom and system certificate templates
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    const custom = getSavedTemplates();
    let templates = [...systemTemplates, ...custom];

    if (courseId) {
      const matched = templates.find(t => t.courseId === courseId);
      if (matched) return NextResponse.json({ success: true, data: matched });
    }

    return NextResponse.json({ success: true, data: templates });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST: Create/Clone a new custom certificate template
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { name, bgImage, courseId, baseTemplateId } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Template name is required' }, { status: 400 });
    }

    const newTemplate = {
      id: `tmpl_custom_${Date.now()}`,
      name: name.trim(),
      bgImage: bgImage || '#ffffff',
      courseId: courseId || 'ALL',
      baseTemplateId: baseTemplateId || 'ai43',
      createdAt: new Date().toISOString(),
      isSystem: false
    };

    let custom = getSavedTemplates();

    if (courseId && courseId !== 'ALL') {
      custom = custom.map(t =>
        t.courseId === courseId ? { ...t, courseId: 'ALL' } : t
      );
    }

    custom.unshift(newTemplate);
    saveTemplates(custom);

    return NextResponse.json({ success: true, data: newTemplate });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE: Delete a custom template by ID
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Template ID required' }, { status: 400 });
    }

    let custom = getSavedTemplates();
    custom = custom.filter(t => t.id !== id);
    saveTemplates(custom);

    return NextResponse.json({ success: true, message: 'Template removed' });
  } catch (error) {
    return handleApiError(error);
  }
}
