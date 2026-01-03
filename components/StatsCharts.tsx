'use client';

import { Card, BarChart, LineChart, DonutChart, Grid, Col, Title, Text, Metric, Flex, ProgressBar } from '@tremor/react';

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

interface StatsChartsProps {
  data: StatsData;
}

// Train type colors matching the map
const TRAIN_COLORS: Record<string, string> = {
  IC: '#EF4444',  // Red
  ICE: '#EF4444', // Red
  IR: '#F59E0B',  // Orange
  RE: '#3B82F6',  // Blue
  S: '#10B981',   // Green
  Other: '#6B7280', // Gray
};

export default function StatsCharts({ data }: StatsChartsProps) {
  // Format data for charts
  const trainsByTypeData = data.trainsByType.map(item => ({
    name: item.type,
    'Number of Trains': item.count,
  }));

  const speedByTypeData = data.speedByType.map(item => ({
    name: item.type,
    'Average Speed (km/h)': item.avgSpeed || 0,
  }));

  const delayData = data.delayDistribution.map(item => ({
    name: item.range,
    'Number of Trains': item.count,
  }));

  const hourlyData = data.hourlyActivity.map(item => ({
    hour: item.hour,
    trains: item.count,
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Grid numItemsMd={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <Flex alignItems="start">
            <div>
              <Text>Active Trains</Text>
              <Metric>{data.activeTrains}</Metric>
            </div>
          </Flex>
        </Card>

        <Card decoration="top" decorationColor="green">
          <Flex alignItems="start">
            <div>
              <Text>On-Time Performance</Text>
              <Metric>{data.onTimePercentage.toFixed(1)}%</Metric>
            </div>
          </Flex>
          <ProgressBar value={data.onTimePercentage} color="green" className="mt-2" />
        </Card>

        <Card decoration="top" decorationColor="orange">
          <Flex alignItems="start">
            <div>
              <Text>Avg Speed</Text>
              <Metric>{data.avgSpeed.toFixed(0)} km/h</Metric>
            </div>
          </Flex>
        </Card>

        <Card decoration="top" decorationColor="purple">
          <Flex alignItems="start">
            <div>
              <Text>24h Trips</Text>
              <Metric>{data.totalTrips24h}</Metric>
            </div>
          </Flex>
        </Card>
      </Grid>

      {/* Charts Grid */}
      <Grid numItemsLg={2} className="gap-6">
        {/* Trains by Type */}
        <Card>
          <Title>Trains by Type</Title>
          <Text>Distribution of active trains by type</Text>
          <DonutChart
            className="mt-6 h-80"
            data={trainsByTypeData}
            category="Number of Trains"
            index="name"
            colors={['red', 'orange', 'blue', 'green', 'gray']}
            showAnimation
          />
        </Card>

        {/* Average Speed by Type */}
        <Card>
          <Title>Average Speed by Train Type</Title>
          <Text>Comparison of average speeds</Text>
          <BarChart
            className="mt-6 h-80"
            data={speedByTypeData}
            index="name"
            categories={['Average Speed (km/h)']}
            colors={['blue']}
            showAnimation
            yAxisWidth={48}
          />
        </Card>
      </Grid>

      {/* Delay Distribution */}
      <Card>
        <Title>Delay Distribution</Title>
        <Text>Number of trains by delay range</Text>
        <BarChart
          className="mt-6 h-80"
          data={delayData}
          index="name"
          categories={['Number of Trains']}
          colors={['red']}
          showAnimation
          yAxisWidth={48}
        />
      </Card>

      {/* 24-Hour Activity */}
      <Card>
        <Title>24-Hour Train Activity</Title>
        <Text>Number of active trains by hour</Text>
        <LineChart
          className="mt-6 h-80"
          data={hourlyData}
          index="hour"
          categories={['trains']}
          colors={['blue']}
          showAnimation
          yAxisWidth={48}
        />
      </Card>
    </div>
  );
}
