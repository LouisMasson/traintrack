import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Use 20-minute window to handle GitHub Actions cron delays (can be 5-15 min during high load)
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Get current active trains with metadata
    const { data: currentData, error: currentError } = await supabase
      .from('train_positions')
      .select(`
        train_no,
        speed,
        delay,
        timestamp
      `)
      .gte('timestamp', twentyMinutesAgo)
      .order('timestamp', { ascending: false });

    if (currentError) {
      throw new Error(`Database error: ${currentError.message}`);
    }

    // Helper function to extract train type from train number
    function getTrainType(trainNo: string): string {
      if (trainNo.startsWith('ICE')) return 'ICE';
      if (trainNo.startsWith('IC')) return 'IC';
      if (trainNo.startsWith('IR')) return 'IR';
      if (trainNo.startsWith('RE')) return 'RE';
      if (trainNo.startsWith('S')) return 'S';
      return 'Other';
    }

    // Get latest position per train
    const latestPositions = new Map();
    currentData?.forEach((pos) => {
      if (!latestPositions.has(pos.train_no)) {
        latestPositions.set(pos.train_no, pos);
      }
    });

    // Calculate statistics
    const trains = Array.from(latestPositions.values());
    const activeTrains = trains.length;

    // Average speed
    const speeds = trains.filter((t) => t.speed !== null).map((t) => t.speed!);
    const avgSpeed = speeds.length > 0
      ? speeds.reduce((a, b) => a + b, 0) / speeds.length
      : 0;

    // Get 24h data
    const { data: trains24h, error: trains24hError } = await supabase
      .from('train_positions')
      .select('train_no, timestamp')
      .gte('timestamp', oneDayAgo);

    if (trains24hError) {
      throw new Error(`Database error: ${trains24hError.message}`);
    }

    const uniqueTrains24h = new Set(trains24h?.map((t) => t.train_no) || []);
    const totalTrips24h = uniqueTrains24h.size;

    // Trains by type
    const typeCount = new Map<string, number>();
    const typeSpeed = new Map<string, number[]>();

    trains.forEach((train) => {
      const type = getTrainType(train.train_no);

      typeCount.set(type, (typeCount.get(type) || 0) + 1);

      if (train.speed !== null) {
        if (!typeSpeed.has(type)) typeSpeed.set(type, []);
        typeSpeed.get(type)!.push(train.speed);
      }
    });

    const trainsByType = Array.from(typeCount.entries()).map(([type, count]) => ({
      type,
      count,
    })).sort((a, b) => b.count - a.count);

    const speedByType = Array.from(typeSpeed.entries()).map(([type, speeds]) => ({
      type,
      avgSpeed: speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0,
    })).sort((a, b) => b.avgSpeed - a.avgSpeed);

    // Delay distribution (using real delay data)
    const delays = {
      onTime: 0,
      minor: 0,      // 1-5 min
      moderate: 0,   // 6-15 min
      major: 0,      // >15 min
    };

    trains.forEach((train) => {
      const delay = train.delay ?? 0;
      if (delay <= 0) delays.onTime++;
      else if (delay <= 5) delays.minor++;
      else if (delay <= 15) delays.moderate++;
      else delays.major++;
    });

    const delayDistribution = [
      { range: 'On Time', count: delays.onTime },
      { range: '1-5 min', count: delays.minor },
      { range: '6-15 min', count: delays.moderate },
      { range: '>15 min', count: delays.major },
    ];

    // Calculate on-time percentage
    const onTimePercentage = activeTrains > 0
      ? Math.round((delays.onTime / activeTrains) * 100)
      : 0;

    // Hourly activity (last 24 hours)
    const hourlyCount = new Map<number, Set<string>>();
    trains24h?.forEach((train) => {
      const hour = new Date(train.timestamp).getUTCHours();
      if (!hourlyCount.has(hour)) hourlyCount.set(hour, new Set());
      hourlyCount.get(hour)!.add(train.train_no);
    });

    const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      count: hourlyCount.get(i)?.size || 0,
    }));

    return NextResponse.json({
      activeTrains,
      avgSpeed,
      totalTrips24h,
      onTimePercentage,
      trainsByType,
      speedByType,
      delayDistribution,
      hourlyActivity,
    });
  } catch (error) {
    console.error('Error fetching train stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
