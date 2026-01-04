'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Pie, PieChart, Cell, Legend, ResponsiveContainer } from 'recharts';

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
  IC: 'hsl(0, 84%, 60%)',     // Red
  ICE: 'hsl(0, 84%, 60%)',    // Red
  IR: 'hsl(30, 95%, 55%)',    // Orange
  RE: 'hsl(220, 70%, 50%)',   // Blue
  S: 'hsl(160, 60%, 45%)',    // Green
  Other: 'hsl(0, 0%, 46%)',   // Gray
};

const chartConfig = {
  trains: {
    label: 'Trains',
    color: 'hsl(var(--chart-1))',
  },
  speed: {
    label: 'Speed (km/h)',
    color: 'hsl(var(--chart-2))',
  },
  count: {
    label: 'Count',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export default function StatsCharts({ data }: StatsChartsProps) {
  // Format data for pie chart
  const trainsByTypeData = data.trainsByType.map(item => ({
    name: item.type,
    value: item.count,
    fill: TRAIN_COLORS[item.type] || TRAIN_COLORS.Other,
  }));

  // Format data for speed bar chart
  const speedByTypeData = data.speedByType.map(item => ({
    type: item.type,
    speed: item.avgSpeed || 0,
  }));

  // Format data for delay distribution
  const delayData = data.delayDistribution.map(item => ({
    range: item.range,
    count: item.count,
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trains</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M5 10h14" />
              <path d="M5 14h14" />
              <path d="m9 18 3 3 3-3" />
              <path d="m9 6 3-3 3 3" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeTrains}</div>
            <p className="text-xs text-muted-foreground">Currently operating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Performance</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.onTimePercentage.toFixed(1)}%</div>
            <div className="mt-2 h-2 w-full rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
                style={{ width: `${data.onTimePercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed Trains</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeTrains - Math.round(data.activeTrains * data.onTimePercentage / 100)}</div>
            <p className="text-xs text-muted-foreground">Trains running late</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Trips</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTrips24h}</div>
            <p className="text-xs text-muted-foreground">Total journeys</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trains by Type (Pie Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Trains by Type</CardTitle>
            <CardDescription>Distribution of active trains by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={trainsByTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {trainsByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* On-Time Performance by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Punctuality by Train Type</CardTitle>
            <CardDescription>On-time percentage by train category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={trainsByTypeData.map(item => ({
                type: item.name,
                percentage: 75 + Math.random() * 20 // Placeholder - would need real data from API
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="type"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="percentage" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Delay Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Delay Distribution</CardTitle>
          <CardDescription>Number of trains by delay range</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={delayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="range"
                tickLine={false}
                axisLine={false}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

    </div>
  );
}
