import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.sidebar}>
            <h2 style={styles.title}>Navigation</h2>
            <button style={styles.button} onClick={() => navigate('/profile')}>
                Profile
            </button>
            <button style={styles.button} onClick={() => navigate('/post')}>
                Post
            </button>
            {/* Add more buttons for other pages */}
        </div>
    );
};

const styles = {
    sidebar: {
        position: 'fixed',
        top: '50px', // Moves the sidebar slightly higher (adjust as needed)
        left: 0,
        height: 'calc(100% - 50px)', // Adjusts height to match the new top position
        width: '200px',
        backgroundColor: '#1c1c1c', // Matte black
        color: 'white',
        padding: '20px',
        boxShadow: '2px 0 5px rgba(0, 0, 0, 0.5)',
        zIndex: 999, // Stays above main content but below the navbar
    },
    title: {
        fontSize: '20px',
        marginBottom: '20px',
    },
    button: {
        display: 'block',
        width: '100%',
        margin: '10px 0',
        padding: '10px',
        backgroundColor: '#333',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
    },
};

export default Sidebar;
