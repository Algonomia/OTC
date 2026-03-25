import Database, { Database as DatabaseType } from 'better-sqlite3';
import { sqlLitePath } from '../common/paths';

const db: DatabaseType = new Database(sqlLitePath, { verbose: console.log });

db.exec(`
    CREATE TABLE IF NOT EXISTS file_metadata (
      uuid TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mimetype TEXT NOT NULL,
      extension TEXT,
      size INTEGER NOT NULL,
      malware_scan TEXT DEFAULT 'PENDING',
      upload_date INTEGER,
      error TEXT,
      additional_data TEXT
    );
`);

export default db;
