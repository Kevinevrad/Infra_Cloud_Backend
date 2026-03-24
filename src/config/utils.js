// TODO : SQL REQUESTS CREATING TABLES---
export const sqlRequests = [
  // TODO : USERS TABLE -- --------------
  `CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE ,
    password TEXT NOT NULL UNIQUE, 
    role TEXT DEFAULT "user",
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,

  // TODO : EXCHANGES TABLE -- -----------
  `CREATE TABLE IF NOT EXISTS exchanges(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,

  // TODO : MESSAGES TABLE -- ------------
  `CREATE TABLE IF NOT EXISTS messages(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    exchange_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (exchange_id) REFERENCES exchanges(id))`,

  // TODO : FILES TABLE -- --------------
  `CREATE TABLE IF NOT EXISTS files(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT,
    path TEXT,
    file_size INTEGER,
    message_id INTEGER,
    mime_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (message_id) REFERENCES messages(id))`,

  // TODO : AUDITS LOGS TABLE -- --------
  `CREATE TABLE IF NOT EXISTS audits_logs(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    entity_id INTEGER,
    action_type TEXT,
    entity_type TEXT,
    user_agent TEXT,
    ip_address TEXT,
    details TEXT ,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (entity_id) REFERENCES users(id))`,

  // TODO : AUDITS LOGS TABLE -- --------
  `CREATE TABLE IF NOT EXISTS upload_session (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE,
    file_name TEXT,
    file_size INTEGER,
    total_chunks INTEGER,
    uploaded_chunks INTEGER DEFAULT 0,
    status TEXT DEFAULT  "Initiated",
    user_id INTEGER,
    mimetype TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);`,
];

// TODO : (NODE SQL) FUNCTIONS ----------------------------------------------
// * ------------------------------------------------------------------------

export const createUser = (name, email, role, password, allUsers, dbName) => {
  const userAlreadyExist = allUsers.find((user) => user.email === email);

  if (userAlreadyExist) {
    throw new Error(" ❌ The user already exist");
  } else {
    const insertUser = dbName.prepare(
      "INSERT INTO users (name,email,role, password) VALUES(?,?,?,?)",
    );
    insertUser.run(name, email, role, password);
    // dbName.close();
  }
};
