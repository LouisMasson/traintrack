'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import TrainDetailsPanel from '@/components/TrainDetailsPanel';
import { TrainPosition } from '@/types/train';

// Dynamic import for TrainMap to avoid SSR issues with Mapbox
const TrainMap = dynamic(() => import('@/components/TrainMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

const REFRESH_INTERVAL = 60000; // 60 seconds

export default function Home() {
  const [trains, setTrains] = useState<TrainPosition[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<TrainPosition | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrains = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/trains/current');

      if (!response.ok) {
        throw new Error('Failed to fetch trains');
      }

      const data = await response.json();
      setTrains(data.trains || []);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching trains:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchTrains();

    const interval = setInterval(fetchTrains, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchTrains]);

  const handleTrainClick = useCallback((train: TrainPosition) => {
    setSelectedTrain(train);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedTrain(null);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Navbar
        trainCount={trains.length}
        lastUpdate={lastUpdate}
        isLoading={isLoading}
      />

      <main className="flex-1 relative mt-14">
        {error ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center p-8">
              <div className="text-red-500 text-xl mb-2">Error loading trains</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchTrains}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <TrainMap
            trains={trains}
            onTrainClick={handleTrainClick}
            selectedTrain={selectedTrain}
          />
        )}

        <TrainDetailsPanel
          train={selectedTrain}
          onClose={handleClosePanel}
        />

        {/* Loading overlay */}
        {isLoading && trains.length > 0 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-10">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
            <span className="text-sm text-gray-600">Updating...</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && trains.length === 0 && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
              <div className="text-4xl mb-3">🚂</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No trains found</h3>
              <p className="text-gray-600 text-sm">
                Train data is collected every minute. If this persists, check your database connection.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
