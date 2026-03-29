// TODO : SQL REQUESTS CREATING TABLES---

export const sqlRequests = [
  // TODO : USERS TABLE -- --------------
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, 
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    quota INTEGER DEFAULT 0,
    used_space INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (DATETIME('now'))
  );`,

  // TODO : EXCHANGES TABLE -- -----------
  `CREATE TABLE IF NOT EXISTS transferts ( 
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id     INTEGER NOT NULL,
    receiver_id   INTEGER NOT NULL,
    file_id       INTEGER NOT NULL,
    status        TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'downloaded')),
    sent_at       TEXT NOT NULL DEFAULT (DATETIME('now')),
    downloaded_at TEXT,
    FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id)     REFERENCES files(id) ON DELETE CASCADE
  );`,

  // TODO : FILES TABLE -- --------------
  `CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT,
    stored_name TEXT UNIQUE,
    path TEXT,
    file_size INTEGER,
    mime_type TEXT,
    ext TEXT NOT NULL CHECK (ext IN('.zip', '.rar')),
    user_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );`,

  // TODO : AUDITS LOGS TABLE -- --------
  `CREATE TABLE IF NOT EXISTS audits_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    entity_id INTEGER,
    action_type TEXT,
    entity_type TEXT,
    user_agent TEXT,
    ip_address TEXT,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (entity_id) REFERENCES users(id)
  );`,

  // TODO : UPLOAD SESSION TABLE -- --------
  `CREATE TABLE IF NOT EXISTS upload_session (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL UNIQUE,
    file_name TEXT,
    file_size INTEGER NOT NULL,
    total_chunks INTEGER NOT NULL,
    uploaded_chunks INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
    user_id INTEGER,
    mimetype TEXT,
    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );`,
];
