import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
    const [profilePicture, setProfilePicture] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const username = 'exampleUser'; // Replace with actual logged-in username

    const handleImageUpload = (e) => {
        const file = e.target.files[0];

        // Validate file type (JPG or PNG)
        if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
            setErrorMessage('Only JPG or PNG files are allowed.');
            return;
        }

        // Validate file dimensions (must be square)
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            if (img.width !== img.height) {
                setErrorMessage('Image must be a square.');
                return;
            }

            // If valid, convert to base64 and upload
            setErrorMessage('');
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result.split(',')[1]; // Extract base64 data
                uploadImage(base64Image);
            };
            reader.readAsDataURL(file);
        };
    };

    const uploadImage = async (base64Image) => {
        try {
            const response = await axios.post('http://localhost:5000/upload-profile-picture', {
                username,
                image: base64Image,
            });
            if (response.status === 200) {
                setSuccessMessage(response.data.message);
                setProfilePicture(`data:image/jpeg;base64,${base64Image}`); // Update UI with uploaded image
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to upload profile picture');
        }
    };

    const fetchProfilePicture = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/get-user/${username}`);
            const user = response.data;
            if (user.profilePicture) {
                setProfilePicture(`data:image/jpeg;base64,${user.profilePicture}`);
            }
        } catch (error) {
            console.error('Failed to fetch profile picture:', error);
        }
    };

    useEffect(() => {
        fetchProfilePicture();
    }, []);

    return (
        <div style={styles.container}>
            <h1>Profile Page</h1>
            <div style={styles.profilePictureContainer}>
                {profilePicture ? (
                    <img
                        src={profilePicture}
                        alt="Profile"
                        style={styles.profilePicture}
                    />
                ) : (
                    <div style={styles.placeholder}>
                        Upload a profile picture
                    </div>
                )}
            </div>
            <input
                type="file"
                accept="image/jpeg, image/png"
                onChange={handleImageUpload}
                style={styles.fileInput}
            />
            {errorMessage && <p style={styles.error}>{errorMessage}</p>}
            {successMessage && <p style={styles.success}>{successMessage}</p>}
        </div>
    );
};

const styles = {
    container: {
        marginLeft: '220px',
        marginTop: '80px',
        padding: '20px',
    },
    profilePictureContainer: {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        overflow: 'hidden',
        marginBottom: '20px',
        border: '2px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profilePicture: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    placeholder: {
        textAlign: 'center',
        color: '#aaa',
    },
    fileInput: {
        margin: '20px 0',
    },
    error: {
        color: 'red',
        marginTop: '10px',
    },
    success: {
        color: 'green',
        marginTop: '10px',
    },
};

export default Profile;
