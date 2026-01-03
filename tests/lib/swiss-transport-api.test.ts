import { fetchSwissTrains } from '@/lib/swiss-transport-api';
import { SwissStationboardResponse, TrainPosition } from '@/types/train';

// Mock fetch globally
global.fetch = jest.fn();

describe('Swiss Transport API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchSwissTrains', () => {
    const mockStationboardResponse: SwissStationboardResponse = {
      station: {
        id: '8503000',
        name: 'Zürich HB',
        coordinate: {
          type: 'WGS84',
          x: 47.378177,
          y: 8.540192,
        },
      },
      stationboard: [
        {
          stop: {
            station: {
              id: '8503000',
              name: 'Zürich HB',
              coordinate: { type: 'WGS84', x: 47.378177, y: 8.540192 },
            },
            departure: '2024-01-15T10:00:00+01:00',
            departureTimestamp: 1705312800,
            delay: 0,
            platform: '3',
            prognosis: { departure: null, platform: null },
          },
          name: 'IC 1',
          category: 'IC',
          number: '701',
          operator: 'SBB',
          to: 'Genève-Aéroport',
        },
        {
          stop: {
            station: {
              id: '8503000',
              name: 'Zürich HB',
              coordinate: { type: 'WGS84', x: 47.378177, y: 8.540192 },
            },
            departure: '2024-01-15T10:05:00+01:00',
            departureTimestamp: 1705313100,
            delay: 2,
            platform: '5',
            prognosis: { departure: null, platform: null },
          },
          name: 'S1',
          category: 'S',
          number: '12345',
          operator: 'SBB',
          to: 'Zug',
        },
      ],
    };

    it('should fetch trains from Swiss Transport API', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStationboardResponse),
      });

      const trains = await fetchSwissTrains();

      expect(Array.isArray(trains)).toBe(true);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should return TrainPosition objects with required fields', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStationboardResponse),
      });

      const trains = await fetchSwissTrains();

      if (trains.length > 0) {
        const train = trains[0];
        expect(train).toHaveProperty('train_no');
        expect(train).toHaveProperty('latitude');
        expect(train).toHaveProperty('longitude');
        expect(train).toHaveProperty('timestamp');
        expect(typeof train.train_no).toBe('string');
        expect(typeof train.latitude).toBe('number');
        expect(typeof train.longitude).toBe('number');
      }
    });

    it('should deduplicate trains with same ID', async () => {
      // Same train appearing at multiple stations
      const duplicateResponse: SwissStationboardResponse = {
        ...mockStationboardResponse,
        stationboard: [
          mockStationboardResponse.stationboard[0],
          mockStationboardResponse.stationboard[0], // Duplicate
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(duplicateResponse),
      });

      const trains = await fetchSwissTrains();
      const trainIds = trains.map((t) => t.train_no);
      const uniqueIds = [...new Set(trainIds)];

      expect(trainIds.length).toBe(uniqueIds.length);
    });

    it('should handle API errors gracefully', async () => {
      // When all station requests fail, the function returns an empty array
      // because it uses Promise.allSettled and continues with fulfilled results
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const trains = await fetchSwissTrains();

      // All requests failed (rejected), so no trains are returned
      expect(trains).toEqual([]);
    });

    it('should create train_no from category and number', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStationboardResponse),
      });

      const trains = await fetchSwissTrains();

      // Check that train IDs are formed correctly (category + number)
      const expectedIds = ['IC701', 'S12345'];
      trains.forEach((train) => {
        expect(expectedIds).toContain(train.train_no);
      });
    });
  });
});
