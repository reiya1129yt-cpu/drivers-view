-- ── Mission templates (seeded, static list of all possible missions) ─────────
CREATE TABLE IF NOT EXISTS mission_templates (
  id          TEXT PRIMARY KEY,
  title_ja    TEXT NOT NULL,
  description_ja TEXT NOT NULL,
  type        TEXT NOT NULL, -- 'post_gas', 'post_streak', 'new_station', 'like', 'comment', 'post_car', 'favorite', 'map_search'
  target      INTEGER NOT NULL DEFAULT 1,  -- how many times action must happen
  points      INTEGER NOT NULL,
  difficulty  TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

INSERT INTO mission_templates (id, title_ja, description_ja, type, target, points, difficulty) VALUES
  ('post_gas_1',    'ガソリン価格を投稿',         'ガソリン価格を1回投稿する',         'post_gas',     1, 3,  'easy'),
  ('post_car_1',    '車の投稿',                   '車関連の投稿を1件作成する',         'post_car',     1, 3,  'easy'),
  ('like_3',        '3件にいいね',                '投稿に3回いいねする',               'like',         3, 3,  'easy'),
  ('comment_1',     'コメントする',               '投稿に1件コメントする',             'comment',      1, 3,  'easy'),
  ('map_search_3',  'マップで検索',               'マップで3回検索する',               'map_search',   3, 5,  'medium'),
  ('favorite_1',    'ガソリンスタンドをお気に入り', 'スタンドを1件お気に入り登録する',   'favorite',     1, 5,  'medium'),
  ('new_station_1', '新スタンドに初投稿',         '未報告スタンドにガス価格を投稿する', 'new_station',  1, 10, 'hard'),
  ('post_streak_3', '3日連続投稿',                '3日間連続でガス価格を投稿する',     'post_streak',  3, 10, 'hard')
ON CONFLICT (id) DO NOTHING;

-- ── Weekly missions assigned per user ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_missions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL,               -- device fingerprint or auth uid
  mission_id      TEXT NOT NULL REFERENCES mission_templates(id),
  week_start      DATE NOT NULL,               -- Monday of the ISO week
  progress        INTEGER NOT NULL DEFAULT 0,
  completed       BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at    TIMESTAMP WITH TIME ZONE,
  rewarded        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mission_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_user_missions_user_week ON user_missions (user_id, week_start);

-- ── Registration bonus (one-time per user) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_registration_bonus (
  user_id         TEXT PRIMARY KEY,
  awarded_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_awarded  INTEGER NOT NULL DEFAULT 20
);

-- ── Point ledger ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_points (
  user_id         TEXT PRIMARY KEY,
  total_points    INTEGER NOT NULL DEFAULT 0,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS point_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  delta       INTEGER NOT NULL,
  label       TEXT NOT NULL,
  source      TEXT NOT NULL, -- 'post', 'mission', 'registration', 'roulette', 'streak', 'like'
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_history_user ON point_history (user_id, created_at DESC);

-- ── RLS ────────────────────────────────────────────────────────────────────────
ALTER TABLE mission_templates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_registration_bonus   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points               ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_history             ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read mission_templates" ON mission_templates FOR SELECT USING (true);
CREATE POLICY "public all user_missions"      ON user_missions     FOR ALL    USING (true) WITH CHECK (true);
CREATE POLICY "public all reg_bonus"          ON user_registration_bonus FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all user_points"        ON user_points       FOR ALL    USING (true) WITH CHECK (true);
CREATE POLICY "public all point_history"      ON point_history     FOR ALL    USING (true) WITH CHECK (true);
