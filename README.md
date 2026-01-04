# 🚂 Train Tracker Switzerland

A real-time train tracking platform displaying Swiss train positions on an interactive map with comprehensive analytics dashboards.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)
![Mapbox](https://img.shields.io/badge/Mapbox-GL%20JS-blue?logo=mapbox)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

- **Live Train Positions** - Updated every 60 seconds via Vercel Cron
- **Interactive Mapbox Map** - Clustered train markers for better visualization
- **Train Type Color Coding** - Visual distinction between IC/ICE, IR, RE, and S-Bahn trains
- **Analytics Dashboard** - Comprehensive statistics with interactive charts using shadcn/ui and Recharts
- **Auto-Refresh** - Real-time updates on both map and analytics views
- **Delay Tracking** - Monitor train punctuality and delay distribution
- **Train Details Panel** - View destination, delay, and train type information
- **Cluster Popups** - Click on clusters to see all trains in that area
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern, accessible UI components
- **Recharts** - Composable charting library for React
- **Mapbox GL JS** - Interactive maps with clustering

### Backend
- **Next.js API Routes** - Serverless functions
- **Supabase** - PostgreSQL database with real-time capabilities
- **Vercel Cron Jobs** - Scheduled data collection

### Data Source
- **Swiss Transport API** - Public API for Swiss public transport data

## 📸 Screenshots

> Screenshots coming soon! The application features:
> - Main map view with train clusters
> - Cluster popup showing multiple trains
> - Train details panel with delay information
> - Analytics dashboard with key metrics and charts

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- Supabase account ([sign up here](https://supabase.com))
- Mapbox account ([sign up here](https://mapbox.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/traintrackfrance.git
   cd traintrackfrance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   ```env
   # Supabase (from https://app.supabase.com/project/_/settings/api)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Mapbox (from https://account.mapbox.com/access-tokens/)
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

   # Cron Secret (generate with: openssl rand -base64 32)
   CRON_SECRET=your_random_secret
   ```

4. **Run database migrations**

   Execute the SQL files in `supabase/migrations/` in your Supabase SQL editor:
   - `001_initial_schema.sql` - Create tables and indexes
   - `002_cleanup_old_data.sql` - Set up retention policies

   See `supabase/migrations/README.md` for details.

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

### First Data Collection

Manually trigger the cron job to collect initial data:

```bash
curl -X GET "http://localhost:3000/api/cron/collect-trains" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Wait 1-2 minutes and refresh the page to see trains on the map.

## 📡 API Endpoints

### `GET /api/trains/current`

Get latest train positions (within last 2 minutes).

**Response:**
```json
{
  "trains": [
    {
      "train_no": "IC1234",
      "latitude": 46.8182,
      "longitude": 8.2275,
      "speed": null,
      "direction": null,
      "delay": 5,
      "timestamp": "2026-01-04T12:00:00Z",
      "destination": "Zürich HB"
    }
  ],
  "count": 98,
  "timestamp": "2026-01-04T12:00:30Z"
}
```

### `GET /api/trains/history?train_no={id}`

Get position history for a specific train.

**Parameters:**
- `train_no` (required) - Train identifier (e.g., "IC1234")

**Response:**
```json
{
  "train_no": "IC1234",
  "positions": [
    {
      "latitude": 46.8182,
      "longitude": 8.2275,
      "timestamp": "2026-01-04T12:00:00Z"
    }
  ],
  "count": 15
}
```

### `GET /api/trains/stats`

Get comprehensive analytics data.

**Response:**
```json
{
  "activeTrains": 98,
  "avgSpeed": 0,
  "totalTrips24h": 106,
  "onTimePercentage": 75.5,
  "trainsByType": [
    { "type": "IC", "count": 25 },
    { "type": "IR", "count": 30 }
  ],
  "speedByType": [],
  "delayDistribution": [
    { "range": "On time", "count": 74 },
    { "range": "1-5 min", "count": 15 }
  ],
  "hourlyActivity": [
    { "hour": "00:00", "count": 12 },
    { "hour": "01:00", "count": 8 }
  ]
}
```

### `POST /api/cron/collect-trains`

Trigger train data collection (protected by CRON_SECRET).

**Headers:**
- `Authorization: Bearer {CRON_SECRET}`

**Response:**
```json
{
  "success": true,
  "count": 98,
  "timestamp": "2026-01-04T12:00:00Z"
}
```

## 🗄️ Database Schema

### `train_positions` Table

Stores time-series position data (7-day retention).

| Column      | Type                     | Description                    |
|-------------|--------------------------|--------------------------------|
| id          | bigint (PK)              | Auto-increment ID              |
| train_no    | text                     | Train identifier               |
| latitude    | double precision         | GPS latitude                   |
| longitude   | double precision         | GPS longitude                  |
| speed       | double precision         | Speed in km/h (nullable)       |
| direction   | double precision         | Direction in degrees (nullable)|
| delay       | integer                  | Delay in minutes (nullable)    |
| timestamp   | timestamptz              | Collection time                |

**Indexes:**
- `idx_train_positions_train_no` - Fast queries by train number
- `idx_train_positions_timestamp` - Fast time-range queries

### `train_metadata` Table

Stores current train information (24-hour retention).

| Column      | Type        | Description              |
|-------------|-------------|--------------------------|
| train_no    | text (PK)   | Train identifier         |
| destination | text        | Final destination        |
| last_seen   | timestamptz | Last position update     |
| updated_at  | timestamptz | Metadata update time     |

See `supabase/migrations/README.md` for detailed schema documentation.

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Add environment variables from `.env.local`

3. **Set up Vercel Cron**

   The project includes a `vercel.json` configuration for cron jobs:
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

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live!

### Environment Variables

Set these in Vercel Project Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `CRON_SECRET`

## 📚 Project Structure

```
traintrackfrance/
├── app/
│   ├── api/
│   │   ├── cron/collect-trains/route.ts    # Data collection cron job
│   │   └── trains/
│   │       ├── current/route.ts            # Current positions API
│   │       ├── history/route.ts            # Position history API
│   │       └── stats/route.ts              # Analytics API
│   ├── stats/
│   │   └── page.tsx                        # Analytics dashboard page
│   ├── page.tsx                            # Main map page
│   └── globals.css                         # Global styles with shadcn/ui theme
├── components/
│   ├── ui/                                 # shadcn/ui components
│   │   ├── card.tsx
│   │   └── chart.tsx
│   ├── Navbar.tsx                          # Navigation header
│   ├── TrainDetailsPanel.tsx               # Train info sidebar
│   ├── TrainMap.tsx                        # Mapbox map with clustering
│   ├── TrainMarker.tsx                     # Individual train markers
│   └── StatsCharts.tsx                     # Analytics charts
├── lib/
│   ├── supabase.ts                         # Supabase client
│   ├── swiss-transport-api.ts              # Swiss Transport API wrapper
│   └── utils.ts                            # Utility functions
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql          # Database schema
│       ├── 002_cleanup_old_data.sql        # Retention policies
│       └── README.md                       # Migration documentation
├── types/
│   └── train.ts                            # TypeScript interfaces
├── .env.example                            # Environment variables template
├── components.json                         # shadcn/ui configuration
└── CLAUDE.md                               # AI assistant instructions
```

## 🎨 Train Type Colors

| Type  | Color  | Description     |
|-------|--------|-----------------|
| IC/ICE| Red    | InterCity       |
| IR    | Orange | InterRegio      |
| RE    | Blue   | RegioExpress    |
| S     | Green  | S-Bahn          |

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run E2E tests with Playwright
```

### Map Configuration

The map is centered on Switzerland with the following bounds:

- **Center**: `[8.2, 46.8]` (longitude, latitude)
- **Zoom**: `7`
- **Bounds**: `[[5.9, 45.8], [10.5, 47.8]]`

### Data Collection

- Trains are collected from major Swiss stations every 60 seconds
- Position data is retained for 7 days
- Metadata is retained for 24 hours
- Automatic cleanup via Supabase policies

## 📝 Notes

- **Swiss Transport API** returns coordinates as `{x: longitude, y: latitude}` (non-standard order)
- **Train speed** is `null` for stations (trains are stopped)
- **Delay data** is collected and displayed in minutes
- **Cluster radius** is set to 50 pixels for optimal visualization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Resources

- [Swiss Transport API Documentation](https://transport.opendata.ch/docs.html)
- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Recharts Documentation](https://recharts.org/)

## 🙏 Acknowledgments

- Swiss public transport data provided by [transport.opendata.ch](https://transport.opendata.ch)
- Maps powered by [Mapbox](https://www.mapbox.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)

---

**Built with** ❤️ **using Next.js, TypeScript, and Swiss precision**
