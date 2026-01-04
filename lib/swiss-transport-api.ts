import { SwissStationboardResponse, TrainPosition } from '@/types/train';

const SWISS_API_URL = 'https://transport.opendata.ch/v1';

// Major Swiss train stations to monitor
const MAJOR_STATIONS = [
  'Zürich HB',
  'Bern',
  'Basel SBB',
  'Genève',
  'Lausanne',
  'Luzern',
  'Winterthur',
  'St. Gallen',
  'Lugano',
  'Biel/Bienne',
];

async function fetchStationboard(station: string): Promise<SwissStationboardResponse> {
  const params = new URLSearchParams({
    station,
    limit: '30',
  });

  const response = await fetch(`${SWISS_API_URL}/stationboard?${params}`);

  if (!response.ok) {
    throw new Error(`Swiss API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchSwissTrains(): Promise<TrainPosition[]> {
  const timestamp = new Date().toISOString();
  const positions: TrainPosition[] = [];
  const seenTrains = new Set<string>();

  // Fetch stationboards from major stations in parallel
  const results = await Promise.allSettled(
    MAJOR_STATIONS.map((station) => fetchStationboard(station))
  );

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;

    const { station, stationboard } = result.value;

    for (const entry of stationboard) {
      // Create unique train ID from category + number
      const trainNo = `${entry.category}${entry.number}`;

      // Skip if we've already seen this train
      if (seenTrains.has(trainNo)) continue;
      seenTrains.add(trainNo);

      // Use station coordinates as current position
      // (This is approximate - train is at/near this station)
      // Swiss Transport API: x = latitude, y = longitude (non-standard!)
      positions.push({
        train_no: trainNo,
        latitude: station.coordinate.x,  // x = latitude (Swiss API convention)
        longitude: station.coordinate.y, // y = longitude (Swiss API convention)
        speed: null, // Not available from this API
        direction: null,
        destination: entry.to || null,
        delay: entry.stop.delay ?? null,
        timestamp,
      });
    }
  }

  return positions;
}
