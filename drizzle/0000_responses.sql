CREATE TABLE responses (
  id TEXT PRIMARY KEY NOT NULL,
  token_hash TEXT NOT NULL,
  revision INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  language TEXT NOT NULL,
  before_choice INTEGER NOT NULL,
  after_choice INTEGER,
  intention INTEGER,
  completed INTEGER NOT NULL DEFAULT 0,
  ended INTEGER NOT NULL DEFAULT 0,
  stage TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  cards_opened TEXT NOT NULL DEFAULT '[]',
  turns TEXT NOT NULL DEFAULT '[]'
);
--> statement-breakpoint
CREATE INDEX responses_updated_at_idx ON responses(updated_at);
