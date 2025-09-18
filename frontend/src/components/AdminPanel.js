import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [cards, setCards] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://cracovautomationhub.pl/api/admin/data', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data.users);
                setCards(data.cards);
                setPermissions(data.permissions);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Błąd podczas pobierania danych');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePermissionChange = async (userId, cardId, hasAccess) => {
        const token = localStorage.getItem('token');
        const action = hasAccess ? 'remove' : 'add';

        try {
            const response = await fetch('http://twoja-domena.pl/api/admin/permissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, cardId, action })
            });
            if (response.ok) {
                fetchData(); // Odśwież dane po zmianie
            } else {
                alert('Błąd aktualizacji uprawnień');
            }
        } catch (err) {
            alert('Wystąpił błąd sieci');
        }
    };

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div>Błąd: {error}</div>;

    return (
        <div className="admin-panel-container">
            <h1>Panel Administratora</h1>

            <div className="permissions-table-wrapper">
                <h2>Zarządzaj uprawnieniami</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Użytkownik</th>
                            {cards.map(card => (
                                <th key={card.id}>{card.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.username} ({user.role})</td>
                                {cards.map(card => {
                                    const hasAccess = permissions.some(p => p.user_id === user.id && p.card_id === card.id);
                                    return (
                                        <td key={card.id}>
                                            <input
                                                type="checkbox"
                                                checked={hasAccess}
                                                onChange={() => handlePermissionChange(user.id, card.id, hasAccess)}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;