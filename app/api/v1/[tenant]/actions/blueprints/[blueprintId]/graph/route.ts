import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ActionBlueprintGraph } from '@/types/graph';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tenant: string; blueprintId: string }> }
) {
  try {
    await params;

    const filePath = path.join(process.cwd(), 'data', 'graph.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const graphData: ActionBlueprintGraph = JSON.parse(data);

    return NextResponse.json(graphData, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load graph.json' },
      { status: 500 }
    );
  }
}
