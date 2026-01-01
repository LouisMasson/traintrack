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
      positions.push({
        train_no: trainNo,
        latitude: station.coordinate.x,
        longitude: station.coordinate.y,
        speed: null, // Not available from this API
        direction: null,
        timestamp,
      });
    }
  }

  return positions;
}
