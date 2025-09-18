require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Konfiguracja bazy danych
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Endpoint logowania
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Nieprawidłowy login lub hasło' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Nieprawidłowy login lub hasło' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// Middleware do weryfikacji tokena i uprawnień
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Brak tokena');

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send('Nieautoryzowany dostęp');
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Brak uprawnień administratora');
  }
  next();
};

// Endpoint dodawania użytkownika (tylko dla admina)
app.post('/api/users', verifyToken, isAdmin, async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
      [username, hashedPassword, role]
    );
    res.status(201).send('Użytkownik dodany pomyślnie');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd serwera');
  }
});

// Endpoint usuwania użytkownika (tylko dla admina)
app.delete('/api/users/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.send('Użytkownik usunięty pomyślnie');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd serwera');
  }
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Server działa na http://localhost:${port}`);
});