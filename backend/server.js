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

// Middleware do weryfikacji tokena i uprawnień
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'Brak tokena' });

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Nieautoryzowany dostęp' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Brak uprawnień administratora' });
  }
  next();
};

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

    let userCards = [];
    if (user.role === 'admin') {
      const allCardsResult = await pool.query('SELECT id, name FROM cards');
      userCards = allCardsResult.rows;
    } else {
      const userCardsResult = await pool.query(
        'SELECT c.id, c.name FROM user_cards uc JOIN cards c ON uc.card_id = c.id WHERE uc.user_id = $1',
        [user.id]
      );
      userCards = userCardsResult.rows;
    }
    
    // Upewnij się, że "Panel Klienta" jest zawsze dostępny dla wszystkich, którzy mają uprawnienia
    const clientPanel = await pool.query("SELECT id, name FROM cards WHERE name = 'Panel Klienta'");
    if (clientPanel.rows.length > 0) {
      const clientPanelCard = clientPanel.rows[0];
      const hasClientPanel = userCards.some(card => card.id === clientPanelCard.id);
      if (!hasClientPanel) {
        userCards.push(clientPanelCard);
      }
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role, cards: userCards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// Endpoint pobierania wszystkich użytkowników i kart (tylko dla admina)
app.get('/api/admin/data', verifyToken, isAdmin, async (req, res) => {
  try {
    const usersResult = await pool.query('SELECT id, username, role FROM users');
    const cardsResult = await pool.query('SELECT id, name FROM cards');
    const userPermissionsResult = await pool.query('SELECT user_id, card_id FROM user_cards');

    res.json({
      users: usersResult.rows,
      cards: cardsResult.rows,
      permissions: userPermissionsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// Endpoint dodawania/usuwania uprawnień (tylko dla admina)
app.post('/api/admin/permissions', verifyToken, isAdmin, async (req, res) => {
  const { userId, cardId, action } = req.body;
  try {
    if (action === 'add') {
      await pool.query('INSERT INTO user_cards (user_id, card_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, cardId]);
      res.status(201).json({ message: 'Uprawnienie dodane' });
    } else if (action === 'remove') {
      await pool.query('DELETE FROM user_cards WHERE user_id = $1 AND card_id = $2', [userId, cardId]);
      res.json({ message: 'Uprawnienie usunięte' });
    } else {
      res.status(400).json({ message: 'Nieprawidłowa akcja' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Server działa na http://localhost:${port}`);
});