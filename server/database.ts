import sqlite3 from 'sqlite3';
import { promisify } from 'util';

export class Database {
  private db: sqlite3.Database | null = null;

  async init() {
    this.db = new sqlite3.Database('splitwise.db');
    
    await this.createTables();
    await this.seedData();
  }

  private async createTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS group_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        FOREIGN KEY (group_id) REFERENCES groups (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(group_id, user_id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        paid_by TEXT NOT NULL,
        split_type TEXT NOT NULL CHECK (split_type IN ('equal', 'percentage')),
        created_at TEXT NOT NULL,
        FOREIGN KEY (group_id) REFERENCES groups (id),
        FOREIGN KEY (paid_by) REFERENCES users (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS expense_splits (
        id TEXT PRIMARY KEY,
        expense_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        percentage REAL,
        FOREIGN KEY (expense_id) REFERENCES expenses (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`
    ];

    for (const query of queries) {
      await this.run(query);
    }
  }

  private async seedData() {
    // Check if users already exist
    const userCount = await this.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count > 0) return;

    // Seed some sample users
    const users = [
      { id: 'user-1', name: 'Alice Johnson' },
      { id: 'user-2', name: 'Bob Smith' },
      { id: 'user-3', name: 'Charlie Brown' },
      { id: 'user-4', name: 'Diana Prince' },
      { id: 'user-5', name: 'Eva Martinez' }
    ];

    for (const user of users) {
      await this.run(
        'INSERT INTO users (id, name, created_at) VALUES (?, ?, ?)',
        [user.id, user.name, new Date().toISOString()]
      );
    }

    console.log('✅ Database seeded with sample users');
  }

  async run(query: string, params: any[] = []): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      this.db!.run(query, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  async get(query: string, params: any[] = []): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      this.db!.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async all(query: string, params: any[] = []): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      this.db!.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}