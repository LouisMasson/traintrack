-- Initial schema for Train Tracker Switzerland
-- Creates tables for train positions and metadata

-- Table: train_positions
-- Stores time-series data of train positions
CREATE TABLE IF NOT EXISTS train_positions (
  id BIGSERIAL PRIMARY KEY,
  train_no VARCHAR(50) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION,
  direction DOUBLE PRECISION,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add delay column if it doesn't exist (for existing tables)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'train_positions' AND column_name = 'delay'
  ) THEN
    ALTER TABLE train_positions ADD COLUMN delay INTEGER;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_train_positions_timestamp ON train_positions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_train_positions_train_no ON train_positions(train_no);
CREATE INDEX IF NOT EXISTS idx_train_positions_train_timestamp ON train_positions(train_no, timestamp DESC);

-- Table: train_metadata
-- Stores static/slowly-changing information about trains
CREATE TABLE IF NOT EXISTS train_metadata (
  train_no VARCHAR(50) PRIMARY KEY,
  route VARCHAR(255),
  destination VARCHAR(255),
  train_type VARCHAR(50),
  last_seen TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_train_metadata_last_seen ON train_metadata(last_seen DESC);

-- Comments for documentation
COMMENT ON TABLE train_positions IS 'Time-series data of train positions collected from Swiss Transport API';
COMMENT ON TABLE train_metadata IS 'Metadata about trains including route, destination, and type';

COMMENT ON COLUMN train_positions.delay IS 'Delay in minutes (positive = late, negative = early)';
COMMENT ON COLUMN train_positions.speed IS 'Speed in km/h (may be null if not available)';
COMMENT ON COLUMN train_positions.direction IS 'Direction in degrees (may be null if not available)';
