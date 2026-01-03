import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TrainPosition } from '@/types/train';

export async function GET() {
  try {
    // Get positions from the last 2 minutes to ensure we have recent data
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    // Get the latest positions
    const { data: positions, error: positionsError } = await supabase
      .from('train_positions')
      .select('*')
      .gte('timestamp', twoMinutesAgo)
      .order('timestamp', { ascending: false });

    if (positionsError) {
      throw new Error(`Database error: ${positionsError.message}`);
    }

    // Get metadata for enriched data (destination)
    const { data: metadata, error: metadataError } = await supabase
      .from('train_metadata')
      .select('train_no, destination');

    if (metadataError) {
      console.error('Failed to fetch metadata:', metadataError.message);
    }

    // Create metadata lookup map
    const metadataMap = new Map(
      (metadata || []).map((m) => [m.train_no, m])
    );

    // Deduplicate and enrich with metadata
    const latestPositions = new Map<string, TrainPosition>();
    for (const position of positions || []) {
      if (!latestPositions.has(position.train_no)) {
        const meta = metadataMap.get(position.train_no);
        latestPositions.set(position.train_no, {
          ...position,
          destination: meta?.destination ?? null,
          // delay is now stored in DB and available from position
        });
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
