import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get positions from the last 2 minutes to ensure we have recent data
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    // Get the latest position for each train
    const { data, error } = await supabase
      .from('train_positions')
      .select('*')
      .gte('timestamp', twoMinutesAgo)
      .order('timestamp', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Deduplicate to get only the latest position per train
    const latestPositions = new Map<string, typeof data[0]>();
    for (const position of data || []) {
      if (!latestPositions.has(position.train_no)) {
        latestPositions.set(position.train_no, position);
      }
    }

    return NextResponse.json({
      trains: Array.from(latestPositions.values()),
      count: latestPositions.size,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching current trains:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
