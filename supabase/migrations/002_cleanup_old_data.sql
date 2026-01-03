-- Data cleanup function for Train Tracker Switzerland
-- Removes train position data older than 7 days to keep database size manageable

-- Function to cleanup old train positions
CREATE OR REPLACE FUNCTION cleanup_old_train_positions()
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
  row_count BIGINT;
BEGIN
  -- Delete positions older than 7 days
  DELETE FROM train_positions
  WHERE timestamp < NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS row_count = ROW_COUNT;

  RETURN QUERY SELECT row_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup stale train metadata (trains not seen in 24 hours)
CREATE OR REPLACE FUNCTION cleanup_stale_train_metadata()
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
  row_count BIGINT;
BEGIN
  -- Delete metadata for trains not seen in 24 hours
  DELETE FROM train_metadata
  WHERE last_seen < NOW() - INTERVAL '24 hours';

  GET DIAGNOSTICS row_count = ROW_COUNT;

  RETURN QUERY SELECT row_count;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON FUNCTION cleanup_old_train_positions() IS 'Deletes train position records older than 7 days. Returns number of deleted rows.';
COMMENT ON FUNCTION cleanup_stale_train_metadata() IS 'Deletes train metadata for trains not seen in 24 hours. Returns number of deleted rows.';

-- Note: To automate cleanup, configure a cron job in Supabase Dashboard:
-- 1. Go to Database > Cron Jobs
-- 2. Create new job:
--    - Schedule: 0 2 * * * (daily at 2 AM)
--    - SQL: SELECT cleanup_old_train_positions(); SELECT cleanup_stale_train_metadata();
