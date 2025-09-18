import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import Contact from './components/Contact';
import About from './components/About';
import ClientPanel from './components/ClientPanel';
import AdminPanel from './components/AdminPanel';

// Komponent do paska nawigacyjnego
const NavBar = ({ isAuthenticated, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="logo">Logo Firmy</div>
      {!isAuthenticated ? (
        <div className="nav-links">
          <Link to="/">Strona Główna</Link>
          <Link to="/about">O nas</Link>
          <Link to="/contact">Kontakt</Link>
          <Link to="/client-panel" className="client-button">Panel Klienta</Link>
        </div>
      ) : (
        <button onClick={onLogout} className="logout-button">Wyloguj</button>
      )}
    </nav>
  );
};

// Główne komponenty
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userCards, setUserCards] = useState([]);

  // Sprawdzanie tokena przy starcie aplikacji
  useEffect(() => {
    const token = localStorage.getItem('token');
    const cards = JSON.parse(localStorage.getItem('userCards') || '[]');
    if (token) {
      setIsAuthenticated(true);
      setUserCards(cards);
      // Można dodać tutaj logikę do odczytywania roli z tokena
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.role);
    }
  }, []);

  const handleLogin = (role, cards) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserCards(cards);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userCards');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserCards([]);
  };

  const Sidebar = () => (
    <div className="sidebar">
      <h3>Menu</h3>
      <ul>
        {userCards.map(card => (
          <li key={card.id}>
            <Link to={`/${card.name.toLowerCase().replace(/\s/g, '-')}`}>{card.name}</Link>
          </li>
        ))}
        {userRole === 'admin' && (
          <li>
            <Link to="/panel-administratora">Panel Administratora</Link>
          </li>
        )}
        <li><button onClick={handleLogout}>Wyloguj</button></li>
      </ul>
    </div>
  );

  return (
    <Router>
      <NavBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <div className="main-content">
        {isAuthenticated && <Sidebar />}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/panel-klienta"
              element={isAuthenticated ? <div>Treść Panelu Klienta (po zalogowaniu)</div> : <ClientPanel onLogin={handleLogin} />}
            />
            {userRole === 'admin' && (
              <Route path="/panel-administratora" element={<AdminPanel />} />
            )}
            {userCards.map(card => (
              <Route
                key={card.id}
                path={`/${card.name.toLowerCase().replace(/\s/g, '-')}`}
                element={<div>Treść dla "{card.name}"</div>}
              />
            ))}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;