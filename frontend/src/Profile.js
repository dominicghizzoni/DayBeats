import React from 'react';

const Profile = () => {
    return (
        <div style={styles.container}>
            <h1>Profile Page</h1>
            <p>Welcome to your profile!</p>
            {/* Add more profile-related information here */}
        </div>
    );
};

const styles = {
    container: {
        marginLeft: '220px', // Leave space for the sidebar
        padding: '20px',
    },
};

export default Profile;
