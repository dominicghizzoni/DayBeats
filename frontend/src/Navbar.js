import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ isLoggedIn, onLogout }) => {
    const navigate = useNavigate();

    return (
        <div style={styles.navbar}>
            <h1 style={styles.title}>DayBeats</h1>
            {isLoggedIn && (
                <button
                    style={styles.logoutButton}
                    onClick={() => {
                        onLogout(); // Trigger logout logic
                        navigate('/'); // Redirect to login page
                    }}
                >
                    Logout
                </button>
            )}
        </div>
    );
};

const styles = {
    navbar: {
        backgroundColor: '#1c1c1c', // Matte black
        color: 'white',
        padding: '10px 20px',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        margin: 0,
        fontSize: '24px',
    },
    logoutButton: {
        backgroundColor: 'red',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        marginRight: '40px',
    },
};

export default Navbar;
