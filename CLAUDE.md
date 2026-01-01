# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Train Tracker Switzerland - a real-time train tracking platform displaying Swiss train positions on an interactive map with analytics dashboards.

## Tech Stack

- Next.js 14 (App Router) with TypeScript
- Supabase (PostgreSQL)
- Mapbox GL JS for maps
- Tremor for charts
- Tailwind CSS
- Vercel (hosting + cron jobs)

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run linter
```

## Architecture

### Frontend
- Next.js App Router with pages at `app/page.tsx` (map view) and `app/stats/page.tsx` (analytics)
- Components in `components/` - TrainMap, TrainMarker, TrainDetailsPanel, StatsCharts, Navbar

### Backend
- Vercel serverless API routes in `app/api/`
- Cron job at `/api/cron/collect-trains/` fetches Swiss train data every minute
- REST endpoints: `/api/trains/current`, `/api/trains/history`, `/api/trains/stats`

### Data Flow
1. Vercel Cron triggers `/api/cron/collect-trains` every minute
2. Handler fetches from Swiss Transport API (stationboards from major stations)
3. Train positions stored in Supabase `train_positions` table
4. Frontend polls `/api/trains/current` for latest positions

### Database Tables
- `train_positions`: time-series data (train_no, lat/lon, timestamp)
- `train_metadata`: static info (route, destination, train_type)

## Key Libraries

- `lib/supabase.ts` - Supabase client configuration
- `lib/swiss-transport-api.ts` - Swiss Transport API wrapper
- `types/train.ts` - TypeScript interfaces

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `CRON_SECRET` (for Vercel Cron auth)

## Train Type Color Coding

- IC/ICE (InterCity): Red `#EF4444`
- IR (InterRegio): Orange `#F59E0B`
- RE (RegioExpress): Blue `#3B82F6`
- S-Bahn: Green `#10B981`

## Map Configuration

- Center: Switzerland (lat: 46.8, lon: 8.2, zoom: 7)
- Bounds: `[[5.9, 45.8], [10.5, 47.8]]`

## Swiss Transport API

- Base URL: `https://transport.opendata.ch/v1`
- Endpoints: `/stationboard`, `/locations`, `/connections`
- No authentication required
- 100% free, CORS enabled
