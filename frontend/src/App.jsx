import './styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Button, Navbar } from 'react-bootstrap';
import CalendarPage from './CalendarPage';
import SongSelect from './SongSelect';
import Login from './Login';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect} from 'react';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('spotifyToken');
    if (token) {
      fetch('http://localhost:5000/verify-token', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(response => response.json())
        .then(data => {
          if (data.valid) {
            setIsLoggedIn(true);
          } else {
            localStorage.removeItem('spotifyToken');
            navigate('/login');
          }
        })
        .catch(() => {
          localStorage.removeItem('spotifyToken');
          navigate('/login');
        });
    }
  }, [navigate]);

  useEffect(() => {
    if (location.pathname === '/callback') {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      if (token) {
        localStorage.setItem('spotifyToken', token);
        setIsLoggedIn(true);
        navigate('/');
      } else if (error) {
        alert(`Login failed: ${error}`);
        navigate('/login');
      } else {
        navigate('/login');
      }
    }
  }, [location, navigate]);

  return (
    <div className="App">
      {isLoggedIn && (
        <Navbar className="top-bar" fixed="top">
          <div style={{ width: "360px" }}></div>
          <div className="mx-auto">
            <h1 className="navbar-title">DayBeats</h1>
          </div>
          <div>
            <Button variant="outline-primary" onClick={() => navigate("/calendar")}>
              View Calendar
            </Button>
            <Button variant="outline-primary" onClick={() => navigate("/")}>
              Song Select
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => {
                localStorage.removeItem('spotifyToken');
                setIsLoggedIn(false);
                navigate('/login');
              }}
            >
              Logout
            </Button>
          </div>
          <div style={{ width: "120px" }}></div>
        </Navbar>
      )}
      <div style={{ paddingTop: isLoggedIn ? "70px" : "0" }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={isLoggedIn ? <SongSelect /> : <Navigate to="/login" />}
          />
          <Route
            path="/calendar"
            element={isLoggedIn ? <CalendarPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/callback"
            element={isLoggedIn ? <Navigate to="/" /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
