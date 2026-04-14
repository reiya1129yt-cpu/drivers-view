-- ── User points table ─────────────────────────────────────────────────────────
-- Stores total points and metadata per user (identified by session_id for guest-safe UX)
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  registration_bonus_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_points_session ON user_points (session_id);

ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read own points" ON user_points FOR SELECT USING (true);
CREATE POLICY "Public insert own points" ON user_points FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update own points" ON user_points FOR UPDATE USING (true);

-- ── Point history table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS point_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  delta INTEGER NOT NULL,
  label TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'post',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_history_session ON point_history (session_id);
CREATE INDEX IF NOT EXISTS idx_point_history_created ON point_history (created_at DESC);

ALTER TABLE point_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read history" ON point_history FOR SELECT USING (true);
CREATE POLICY "Public insert history" ON point_history FOR INSERT WITH CHECK (true);

-- ── Weekly missions definition table ──────────────────────────────────────────
-- Static mission templates (seeded below)
CREATE TABLE IF NOT EXISTS mission_templates (
  id TEXT PRIMARY KEY,
  title_ja TEXT NOT NULL,
  description_ja TEXT NOT NULL,
  action_type TEXT NOT NULL,  -- 'post_gas', 'post_3days', 'new_station', 'like', 'comment', 'post_car', 'favorite', 'map_search'
  target_count INTEGER NOT NULL DEFAULT 1,
  reward_pts INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

INSERT INTO mission_templates (id, title_ja, description_ja, action_type, target_count, reward_pts, difficulty) VALUES
  ('post_gas_1',     'ガソリン価格を投稿',         'ガソリン価格を1回投稿しよう',         'post_gas',    1, 3,  'easy'),
  ('post_3days',     '3日連続投稿',               '3日連続でガソリン価格を投稿しよう',     'post_3days',  3, 10, 'hard'),
  ('new_station',    '新スタンドを登録',           '新しいガソリンスタンドを初投稿しよう',  'new_station', 1, 10, 'hard'),
  ('like_3',         '3件いいね',                 '他のユーザーの投稿に3件いいねしよう',   'like',        3, 3,  'easy'),
  ('comment_1',      'コメントする',               '投稿にコメントしよう',                 'comment',     1, 5,  'medium'),
  ('post_car',       'クルマ投稿',                'クルマの話題を1件投稿しよう',           'post_car',    1, 5,  'medium'),
  ('favorite_1',     'お気に入り登録',             'ガソリンスタンドをお気に入りに追加',    'favorite',    1, 3,  'easy'),
  ('map_search_3',   'マップ検索3回',              'マップで3回検索しよう',                'map_search',  3, 5,  'medium')
ON CONFLICT (id) DO NOTHING;

-- ── User weekly missions table ─────────────────────────────────────────────────
-- Tracks which missions are assigned to a user this week and their progress
CREATE TABLE IF NOT EXISTS user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  mission_id TEXT NOT NULL REFERENCES mission_templates(id),
  week_start DATE NOT NULL,  -- Monday of the current week
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (session_id, mission_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_user_missions_session_week ON user_missions (session_id, week_start);

ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read missions" ON user_missions FOR SELECT USING (true);
CREATE POLICY "Public insert missions" ON user_missions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update missions" ON user_missions FOR UPDATE USING (true);
