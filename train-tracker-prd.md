# Train Tracker Switzerland - Product Requirements Document

**Type**: Web App

---

## Problem

Train passengers and enthusiasts lack real-time visibility into train positions and network-wide analytics. While individual train schedules are available, there's no comprehensive open-source view showing all trains in motion, their delays, and historical patterns. This makes it difficult to understand network performance, plan journeys effectively, or analyze traffic patterns.

## Objective

Build a real-time train tracking platform for Switzerland that displays live train positions on an interactive map with analytics dashboards showing network statistics, historical trends, and performance metrics.

## User Personas

- **Train Enthusiast**: Wants to watch trains move in real-time across Switzerland and explore network patterns
- **Data Analyst**: Needs historical data on train frequencies and delays for research or reporting
- **Commuter**: Checks real-time positions to verify their train is on schedule before heading to the station

## Core Features

### MVP (Phase 1)
1. **Live Train Map** - Interactive map displaying all active trains with real-time position updates every 60 seconds using Swiss Transport API
2. **Train Details Panel** - Click on any train marker to see train number, route, destination, and delay status
3. **Auto-refresh** - Automatic data refresh with visual loading states and last-update timestamp
4. **Train Type Styling** - Color-coded train markers based on train type (IC, IR, RE, S-Bahn)

### Advanced (Phase 2)
5. **Analytics Dashboard** - Charts showing trains in circulation over time, delays by hour, and network activity heatmaps
6. **Historical Playback** - Replay train movements from previous days with timeline scrubber
7. **Route Filtering** - Filter visible trains by route, destination, or train type
8. **Performance Metrics** - Track delays, on-time performance, and busiest routes with Tremor charts

## Tech Stack

Next.js 14 (App Router) TypeScript Supabase (PostgreSQL) Mapbox GL JS Tremor (Charts) Tailwind CSS Vercel (Hosting + Cron)

## Architecture

### Frontend
Next.js 14 App Router with TypeScript, using Mapbox GL JS for interactive maps and Tremor components for analytics dashboards, styled with Tailwind CSS.

### Backend
Vercel serverless API routes handle Swiss Transport API fetching via scheduled Cron jobs (every minute), storing train positions in Supabase with REST API endpoints for frontend data access.

### Database
Supabase PostgreSQL with two main tables: `train_positions` (time-series data with train_no, lat/lon, timestamp) and `train_metadata` (routes, destinations), indexed for fast time-range queries.

---

## Data Model

### Table: `train_positions`
```sql
CREATE TABLE train_positions (
  id BIGSERIAL PRIMARY KEY,
  train_no VARCHAR(20) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  speed INTEGER,
  direction INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_train_timestamp ON train_positions(train_no, timestamp DESC);
CREATE INDEX idx_timestamp ON train_positions(timestamp DESC);
```

### Table: `train_metadata`
```sql
CREATE TABLE train_metadata (
  train_no VARCHAR(20) PRIMARY KEY,
  route VARCHAR(200),
  destination VARCHAR(100),
  train_type VARCHAR(50),
  last_seen TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Integration

### Swiss Transport API (transport.opendata.ch)
- **Base URL**: `https://transport.opendata.ch/v1`
- **Endpoints**:
  - `/stationboard?station={name}` - Departures at a station
  - `/locations?query={name}` - Search stations
  - `/connections?from={A}&to={B}` - Route planning
- **Authentication**: None required (public API)
- **Rate Limit**: No strict limit, reasonable usage recommended
- **Response Format**: JSON with station coordinates, train details, delays
- **Features**: 100% free, no registration, CORS enabled, real-time delays

### Vercel Cron Configuration
```json
{
  "crons": [
    {
      "path": "/api/cron/collect-trains",
      "schedule": "* * * * *"
    }
  ]
}
```

## File Structure

```
train-tracker/
├── app/
│   ├── page.tsx                      # Main map view
│   ├── stats/
│   │   └── page.tsx                  # Analytics dashboard
│   ├── layout.tsx                    # Root layout with navbar
│   └── api/
│       ├── cron/
│       │   └── collect-trains/
│       │       └── route.ts          # Vercel Cron job handler
│       └── trains/
│           ├── current/route.ts      # GET latest positions
│           ├── history/route.ts      # GET historical data
│           └── stats/route.ts        # GET analytics metrics
├── components/
│   ├── TrainMap.tsx                  # Mapbox GL map component
│   ├── TrainMarker.tsx               # Custom train marker
│   ├── TrainDetailsPanel.tsx         # Train info sidebar
│   ├── StatsCharts.tsx               # Tremor chart components
│   └── Navbar.tsx                    # Navigation header
├── lib/
│   ├── supabase.ts                   # Supabase client config
│   ├── swiss-transport-api.ts        # Swiss Transport API wrapper
│   └── utils.ts                      # Helper functions
├── types/
│   └── train.ts                      # TypeScript interfaces
├── public/
│   └── train-icon.svg                # Custom train marker icon
├── .env.local.example
├── next.config.js
├── tailwind.config.ts
├── package.json
└── README.md
```

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Vercel Cron Security
CRON_SECRET=random_secret_string
```

## Key Components Breakdown

### 1. TrainMap Component
- Mapbox GL JS map centered on Switzerland (lat: 46.8, lon: 8.2, zoom: 7)
- Custom train markers using Mapbox symbols or React markers
- Click handlers to show train details panel
- Real-time updates via React state from API polling

### 2. Cron Job Handler (`/api/cron/collect-trains/route.ts`)
```typescript
export async function GET(request: Request) {
  // Verify Vercel Cron auth header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch Swiss Transport data
  const trains = await fetchSwissTrains();

  // Insert into Supabase
  const { error } = await supabase
    .from('train_positions')
    .insert(trains);

  return Response.json({ success: true, count: trains.length });
}
```

### 3. Analytics Dashboard (`/app/stats/page.tsx`)
Tremor charts displaying:
- **Area Chart**: Trains in circulation over last 24 hours
- **Bar Chart**: Average delays by hour of day
- **Metric Cards**: Current trains, avg delay, total trains tracked
- **Line Chart**: On-time performance trends (Phase 2)

## Design Guidelines

### Color Palette (by train type)
- **IC/ICE (InterCity)**: Red `#EF4444`
- **IR (InterRegio)**: Orange `#F59E0B`
- **RE (RegioExpress)**: Blue `#3B82F6`
- **S-Bahn**: Green `#10B981`

### Map Style
- Mapbox Streets or Light theme
- Switzerland bounds: `[[5.9, 45.8], [10.5, 47.8]]`
- Train markers: Custom SVG icon or circle with train type overlay

### Responsive Design
- Mobile: Full-screen map with bottom sheet for train details
- Desktop: Split view with map (70%) and stats sidebar (30%)
- Tablet: Stacked layout with map above stats

## Deployment Strategy

### GitHub Codespaces Setup
1. Create new repo with Next.js 14 template
2. Open in Codespaces (prebuild with Node 20)
3. Install dependencies: `npm install`
4. Configure `.env.local` with Supabase + Mapbox credentials
5. Run dev server: `npm run dev`
6. Test Cron locally with manual endpoint trigger

### Vercel Deployment
1. Connect GitHub repo to Vercel
2. Configure environment variables in Vercel dashboard
3. Enable Vercel Cron in project settings
4. Deploy: Auto-deploy on `main` branch push
5. Verify Cron execution in Vercel logs

### Supabase Setup
1. Create new Supabase project
2. Run SQL migrations for tables and indexes
3. Enable Row Level Security (RLS) policies:
   - Public read access to `train_positions` and `train_metadata`
   - Service role only for inserts (Cron job)
4. Monitor database size (free tier: 500 MB)

## Success Metrics

### Phase 1 (MVP)
- Map loads with 50+ trains displayed within 3 seconds
- Data refreshes every 60 seconds without user action
- Train details panel shows accurate info on click
- Mobile responsive (works on iPhone/Android)

### Phase 2 (Analytics)
- Historical data retention: 30+ days
- Dashboard charts render <2 seconds
- Ability to filter 10,000+ historical records
- Playback feature renders smooth animations

## Known Limitations

1. **Position Approximation**: Swiss Transport API provides station-based data; train positions are at stations, not interpolated between stations
2. **Historical Data**: API doesn't provide historical archives; we build our own from collected data
3. **Update Frequency**: Data collected every 60 seconds
4. **Free Tier Limits**: Supabase 500MB may fill after ~6 months of data (need cleanup job or upgrade)

## Future Enhancements

- **Position Interpolation**: Calculate estimated positions between stations based on schedule
- **geOps Integration**: Add real-time GPS positions when API key is available
- **Alerts**: Email/push notifications when specific trains depart or arrive
- **Multi-country**: Expand to Germany (DB), France (SNCF), Austria (OBB)
- **3D visualization**: Mapbox GL terrain for topographic context
- **Public API**: Expose our collected data via REST API for developers

## References

- Swiss Transport API: https://transport.opendata.ch
- geOps Live Tracker: https://tracker.geops.ch
- Mapbox GL JS docs: https://docs.mapbox.com/mapbox-gl-js
- Tremor components: https://tremor.so
- Supabase docs: https://supabase.com/docs

---

**Ready for Claude Code**: This PRD provides all necessary context for an AI coding assistant to implement the complete application in a GitHub Codespace environment with Next.js 14, Supabase, and Vercel deployment.
