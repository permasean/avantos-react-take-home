import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string; blueprintId: string }> }
) {
  try {
    const { tenant, blueprintId } = await params;

    const filePath = path.join(process.cwd(), 'data', 'graph.json');
    const data = fs.readFileSync(filePath, 'utf8');

    return NextResponse.json(JSON.parse(data), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load graph.json' },
      { status: 500 }
    );
  }
}
