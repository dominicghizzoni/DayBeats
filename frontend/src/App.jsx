import './styles/App.css';
import './styles/SongSelect.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Button, Navbar, Image, Dropdown } from 'react-bootstrap'; // Add Image import
import CalendarPage from './CalendarPage';
import SongSelect from './SongSelect';
import Login from './Login';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

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
            fetch('https://api.spotify.com/v1/me', {
              headers: { 'Authorization': `Bearer ${token}` },
            })
              .then(response => {
                if (response.status === 401) {
                  localStorage.removeItem('spotifyToken');
                  navigate('/login');
                  return Promise.reject('Unauthorized');
                }
                return response.json();
              })
              .then(userData => {
                if (userData.images && userData.images.length > 0) {
                  setProfilePicture(userData.images[0].url);
                }
              })
              .catch(error => {
                console.error('Error fetching user profile:', error);
              });
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
        fetch('https://api.spotify.com/v1/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
          .then(response => {
            if (response.status === 401) {
              localStorage.removeItem('spotifyToken');
              navigate('/login');
              return Promise.reject('Unauthorized');
            }
            return response.json();
          })
          .then(userData => {
            if (userData.images && userData.images.length > 0) {
              setProfilePicture(userData.images[0].url);
            }
          })
          .catch(error => {
            console.error('Error fetching user profile:', error);
          });
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
          <div className="d-flex align-items-center">
            <Button className="select-btn" onClick={() => navigate("/calendar")}>
              View Calendar
            </Button>
            <Button className="select-btn" onClick={() => navigate("/")}>
              Song Select
            </Button>

            {profilePicture && (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="link"
                  id="profile-dropdown"
                  className="bar-drop p-0 border-0 bg-transparent"
                >

                <Image
                  src={profilePicture}
                  alt="Profile"
                  roundedCircle
                  className='profile-image'
                  style={{ width: '40px', height: '40px', marginLeft: '10px' }}
                />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate("/calendar")}>
                  View Calendar
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/")}>
                  Song Select
                </Dropdown.Item>
                <Dropdown.Divider/>
                <Dropdown.Item
                  onClick={() => {
                    localStorage.removeItem("spotifyToken");
                    setIsLoggedIn(false);
                    setProfilePicture(null);
                    navigate("/login");
                  }}
                >
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}

          </div>
          <div style={{ width: "120px" }}></div>
        </Navbar>
      )}
      <div style={{ paddingTop: isLoggedIn ? "70px" : "0" }}>
        <Routes>
          <Route 
            path="/login"
            element={!isLoggedIn ? <Login /> : <Navigate to="/"/>} 
          />
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