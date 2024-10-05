// sqlite db

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

if (!fs.existsSync('./data/db.sqlite')) fs.mkdirSync('./data');
const db = await open({ filename: './data/db.sqlite', driver: sqlite3.Database }); 

export default db;
