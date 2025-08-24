import "./App.css"
import { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(''); 
    
    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };
    
    const handleSpotifyLogin = () => {
        window.location.href = "http://localhost:5000/splogin"
    };

    return (
        <div>
            <label htmlFor="myInput">Username</label>
            <input
                type="text"
                id="myUsername"
                value={username}
                onChange={handleUsernameChange}
            />
            <p>Current input: {username}</p>
            <label htmlFor="myInput">Password</label>
            <input
                type="text"
                id="myPassword"
                value={password}
                onChange={handlePasswordChange}
            />
            <p>Current input: {password}</p>
            <Container className="d-flex justify-content-end mt-3">
                <Button variant="outline-primary" onClick={() => navigate("/")}>
                Login
                </Button>
            </Container>

            <Container className="d-flex justify-content-end mt-3">
                <Button variant="success" onClick={handleSpotifyLogin}>
                    Login with Spotify
                </Button>
            </Container>
        </div>
    );
}

export default Login