import React from 'react';
import '../styles/LandingPage.css'; // Dodaj ten plik CSS

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header className="hero-section">
        <h1>Witaj na Stronie Głównej Twojej Aplikacji</h1>
        <p>Stwórzmy razem coś niesamowitego. To jest Twoja platforma do zarządzania klientami i zasobami.</p>
        <button className="cta-button">Dowiedz się więcej</button>
      </header>
      <section className="features-section">
        <div className="feature-card">
          <h2>Panel Klienta</h2>
          <p>Dostęp do wszystkich kluczowych informacji i dokumentów w jednym miejscu.</p>
        </div>
        <div className="feature-card">
          <h2>Panel Administratora</h2>
          <p>Zarządzaj użytkownikami, uprawnieniami i danymi w prosty sposób.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;