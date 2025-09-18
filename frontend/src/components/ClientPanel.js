import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ClientPanel.css';

const ClientPanel = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://cracovautomationhub.pl/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userCards', JSON.stringify(data.cards));
        onLogin(data.role, data.cards);
        navigate('/client-panel');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Błąd logowania:', error);
      alert('Wystąpił błąd podczas logowania. Sprawdź połączenie.');
    }
  };

  return (
    <div className="login-form-container">
      <h2>Panel Klienta</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Nazwa użytkownika:</label>
          <input
            type="text"
            id="username"
            placeholder="Wprowadź nazwę użytkownika"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Hasło:</label>
          <input
            type="password"
            id="password"
            placeholder="Wprowadź hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Zaloguj</button>
      </form>
    </div>
  );
};

export default ClientPanel;