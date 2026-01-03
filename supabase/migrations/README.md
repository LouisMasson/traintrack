# Database Migrations

This directory contains SQL migration files for the Train Tracker Switzerland database.

## Files

- `001_initial_schema.sql` - Creates the initial database schema (train_positions and train_metadata tables)
- `002_cleanup_old_data.sql` - Creates cleanup functions for removing old data

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of each migration file
4. Run them in order (001, then 002)

### Option 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Option 3: Manual SQL Execution

Connect to your Supabase PostgreSQL database using any SQL client and run the migration files in order.

## Setting Up Automated Cleanup

After applying migrations, set up a cron job in Supabase:

1. Go to **Database** > **Cron Jobs** in Supabase Dashboard
2. Click **Create a new cron job**
3. Configure:
   - **Name**: Daily Cleanup
   - **Schedule**: `0 2 * * *` (daily at 2 AM UTC)
   - **SQL**:
     ```sql
     SELECT cleanup_old_train_positions();
     SELECT cleanup_stale_train_metadata();
     ```

## Schema Overview

### train_positions
Stores time-series position data:
- `id`: Primary key
- `train_no`: Train identifier
- `latitude`, `longitude`: Geographic coordinates
- `speed`, `direction`: Motion data (may be null)
- `delay`: Delay in minutes (may be null)
- `timestamp`: When position was recorded
- `created_at`: When record was inserted

**Retention**: 7 days (older records automatically deleted)

### train_metadata
Stores train metadata:
- `train_no`: Primary key (train identifier)
- `route`: Route name/number
- `destination`: Final destination station
- `train_type`: Type of train (IC, IR, RE, S, etc.)
- `last_seen`: Last time train was observed
- `updated_at`: Last metadata update

**Retention**: Removed if train not seen in 24 hours

## Notes

- Indexes are created automatically for optimal query performance
- Use `delay` column after applying this migration (currently commented out in code)
- Cleanup functions can be run manually anytime: `SELECT cleanup_old_train_positions();`
