-- Create flips table
CREATE TABLE IF NOT EXISTS flips (
    id BIGSERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('heads', 'tails')),
    amount DECIMAL NOT NULL,
    won BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
    wallet_address TEXT PRIMARY KEY,
    total_wins INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    total_flips INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_flips_wallet_address ON flips(wallet_address);
CREATE INDEX IF NOT EXISTS idx_flips_created_at ON flips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_total_wins ON leaderboard(total_wins DESC);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for leaderboard updated_at
CREATE TRIGGER update_leaderboard_updated_at
    BEFORE UPDATE ON leaderboard
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE flips ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read flips and leaderboard
CREATE POLICY read_flips ON flips
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY read_leaderboard ON leaderboard
    FOR SELECT
    TO anon
    USING (true);

-- Allow authenticated users to insert their own flips
CREATE POLICY insert_flips ON flips
    FOR INSERT
    TO authenticated
    WITH CHECK (wallet_address = auth.uid());

-- Allow authenticated users to update their own leaderboard entry
CREATE POLICY update_leaderboard ON leaderboard
    FOR UPDATE
    TO authenticated
    USING (wallet_address = auth.uid())
    WITH CHECK (wallet_address = auth.uid());

-- Allow authenticated users to insert their own leaderboard entry
CREATE POLICY insert_leaderboard ON leaderboard
    FOR INSERT
    TO authenticated
    WITH CHECK (wallet_address = auth.uid());
