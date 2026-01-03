import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchSwissTrains } from '@/lib/swiss-transport-api';

export async function GET(request: NextRequest) {
  // Verify Vercel Cron authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const trains = await fetchSwissTrains();

    if (trains.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No trains found' });
    }

    // Insert train positions
    // Note: delay column doesn't exist in DB yet, will be added in migration
    const positionsToInsert = trains.map((train) => ({
      train_no: train.train_no,
      latitude: train.latitude,
      longitude: train.longitude,
      speed: train.speed,
      direction: train.direction,
      delay: train.delay,
      timestamp: train.timestamp,
    }));

    const { error: positionsError } = await supabaseAdmin
      .from('train_positions')
      .insert(positionsToInsert);

    if (positionsError) {
      throw new Error(`Failed to insert positions: ${positionsError.message}`);
    }

    // Update train metadata (destination, last_seen - delay stored in memory only)
    const metadataUpdates = trains.map((train) => ({
      train_no: train.train_no,
      destination: train.destination,
      last_seen: train.timestamp,
      updated_at: train.timestamp,
    }));

    const { error: metadataError } = await supabaseAdmin
      .from('train_metadata')
      .upsert(metadataUpdates, { onConflict: 'train_no' });

    if (metadataError) {
      console.error('Failed to update metadata:', metadataError.message);
    }

    return NextResponse.json({
      success: true,
      count: trains.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
