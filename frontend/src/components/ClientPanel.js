import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ClientPanel = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        onLogin(data.role);
        navigate('/client-panel'); // Przekieruj do panelu klienta
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Błąd logowania:', error);
      alert('Wystąpił błąd podczas logowania');
    }
  };

  return (
    <div className="login-form-container">
      <h2>Panel Logowania</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nazwa użytkownika"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Zaloguj</button>
      </form>
    </div>
  );
};

export default ClientPanel;