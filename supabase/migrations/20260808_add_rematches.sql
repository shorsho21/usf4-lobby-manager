-- Apply this migration in the Supabase SQL editor before deploying the feature.
-- duel_history keeps completed duels; rematch_requests records the decision flow.
ALTER TABLE duel_history
  ADD COLUMN IF NOT EXISTS finished_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS rematch_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_duel_id text NOT NULL,
  requester_discord_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS rematch_requests_one_pending_per_duel
  ON rematch_requests (original_duel_id)
  WHERE status = 'pending';
