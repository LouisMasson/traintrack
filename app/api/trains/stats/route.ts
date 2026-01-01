import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Get current active trains count and average speed
    const { data: currentData, error: currentError } = await supabase
      .from('train_positions')
      .select('train_no, speed')
      .gte('timestamp', twoMinutesAgo);

    if (currentError) {
      throw new Error(`Database error: ${currentError.message}`);
    }

    // Deduplicate trains
    const uniqueTrains = new Set(currentData?.map((t) => t.train_no) || []);
    const speeds = currentData?.filter((t) => t.speed !== null).map((t) => t.speed!) || [];
    const avgSpeed = speeds.length > 0
      ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length)
      : 0;

    // Get total positions collected in the last 24h
    const { count: totalPositions24h, error: countError } = await supabase
      .from('train_positions')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', oneDayAgo);

    if (countError) {
      throw new Error(`Database error: ${countError.message}`);
    }

    // Get unique trains seen in last 24h
    const { data: trains24h, error: trains24hError } = await supabase
      .from('train_positions')
      .select('train_no')
      .gte('timestamp', oneDayAgo);

    if (trains24hError) {
      throw new Error(`Database error: ${trains24hError.message}`);
    }

    const uniqueTrains24h = new Set(trains24h?.map((t) => t.train_no) || []);

    return NextResponse.json({
      current: {
        activeTrains: uniqueTrains.size,
        averageSpeed: avgSpeed,
      },
      last24h: {
        totalPositions: totalPositions24h || 0,
        uniqueTrains: uniqueTrains24h.size,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching train stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
