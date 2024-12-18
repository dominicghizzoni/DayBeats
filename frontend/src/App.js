import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Login from './Login';
import Register from './Register';
import PostPage from './PostPage';
import Profile from './Profile';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Replace with actual authentication logic

    const handleLogout = () => {
        setIsLoggedIn(false); // Update the state to log out
        // Clear any authentication tokens or session data here
    };

    return (
        <Router>
            <div>
                <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
                {isLoggedIn && <Sidebar />}
                <div
                    style={{
                        marginLeft: isLoggedIn ? '220px' : '0',
                        marginTop: '60px',
                        padding: '20px',
                    }}
                >
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        {isLoggedIn && (
                            <>
                                <Route path="/post" element={<PostPage />} />
                                <Route path="/profile" element={<Profile />} />
                            </>
                        )}
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
