import "./styles/App.css";
import "./styles/Login.css";
import { Container, Button } from 'react-bootstrap';

function Login() {
  const handleSpotifyLogin = () => {
    window.location.href = "http://localhost:5000/splogin";
  };

  return (
    <div>
      <Container className="d-flex justify-content-center mt-3">
        <Button className="login-btn" onClick={handleSpotifyLogin}>
          Login with Spotify
        </Button>
      </Container>
    </div>
  );
}

export default Login;