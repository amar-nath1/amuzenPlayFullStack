const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data.json');

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = { users: [], orders: [], winners: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE);
    return JSON.parse(raw.toString());
  } catch (e) {
    console.error('readDB error', e);
    return { users: [], orders: [], winners: [] };
  }
}

function writeDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

module.exports = { readDB, writeDB };
