'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import StatsCharts from '@/components/StatsCharts';

interface StatsData {
  activeTrains: number;
  avgSpeed: number;
  totalTrips24h: number;
  onTimePercentage: number;
  trainsByType: { type: string; count: number }[];
  speedByType: { type: string; avgSpeed: number }[];
  delayDistribution: { range: string; count: number }[];
  hourlyActivity: { hour: string; count: number }[];
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/trains/stats');

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        trainCount={data?.activeTrains || 0}
        lastUpdate={lastUpdate}
        isLoading={loading}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Train Analytics
          </h1>
          <p className="text-gray-600">
            Real-time statistics and insights from Swiss railway network
          </p>
        </div>

        {loading && !data && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading statistics...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading statistics</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <button
                  onClick={fetchStats}
                  className="mt-4 text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Try again →
                </button>
              </div>
            </div>
          </div>
        )}

        {data && !error && (
          <StatsCharts data={data} />
        )}

        {!data && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500">No statistics available</p>
          </div>
        )}
      </main>
    </div>
  );
}
