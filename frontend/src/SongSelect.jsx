import './styles/App.css';
import './styles/SongSelect.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Col, Card } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SongSelect() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [topTracks, setTracks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('spotifyToken');
    if (token) {
      setAccessToken(token);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchInput.length > 0 && accessToken && isTyping) {
        fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchInput)}&type=track&limit=5`, {
          headers: {
            'Authorization': 'Bearer ' + accessToken
          }
        })
          .then(response => {
            if (response.status === 401) {
              localStorage.removeItem('spotifyToken');
              navigate('/login');
              return Promise.reject('Unauthorized');
            }
            return response.json();
          })
          .then(data => {
            if (data.tracks && data.tracks.items) {
              setSuggestions(data.tracks.items);
              setShowSuggestions(true);
            }
          })
          .catch(error => console.error('Error searching tracks:', error));
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchInput, accessToken, isTyping, navigate]);

  async function search(trackID) {
    if (!trackID) return;

    setSuggestions([]);
    setShowSuggestions(false);
    setIsTyping(false);

    const searchHeaders = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    };

    try {
      const trackInfo = await fetch(`https://api.spotify.com/v1/tracks/${trackID}`, searchHeaders)
        .then(res => {
          if (res.status === 401) {
            localStorage.removeItem('spotifyToken');
            navigate('/login');
            return Promise.reject('Unauthorized');
          }
          return res.json();
        });

      setSelectedTrack(trackInfo);

      const artistID = trackInfo.artists[0].id;

      const topTracksData = await fetch(`https://api.spotify.com/v1/artists/${artistID}/top-tracks?market=US`, searchHeaders)
        .then(res => {
          if (res.status === 401) {
            localStorage.removeItem('spotifyToken');
            navigate('/login');
            return Promise.reject('Unauthorized');
          }
          return res.json();
        });

      setTracks(topTracksData.tracks);
    } catch (error) {
      console.error('Error fetching track or top tracks:', error);
    }
  }

  async function handle(track) {
    const token = localStorage.getItem('spotifyToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/save-song', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          track_id: track.id,
          track_name: track.name,
          artist_name: track.artists[0].name,
          album_image_url: track.album.images[0]?.url
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        navigate("/calendar", { state: { selectedTrack: track } });
      } else if (res.status === 401) {
        const refreshRes = await fetch('http://localhost:5000/refresh-token');
        const refreshData = await refreshRes.json();
        if (refreshRes.ok && refreshData.access_token) {
          localStorage.setItem('spotifyToken', refreshData.access_token);
          const retryRes = await fetch('http://localhost:5000/api/save-song', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${refreshData.access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              track_id: track.id,
              track_name: track.name,
              artist_name: track.artists[0].name,
              album_image_url: track.album.images[0]?.url
            })
          });
          const retryData = await retryRes.json();
          if (retryRes.ok && retryData.success) {
            navigate("/calendar", { state: { selectedTrack: track } });
          } else {
            console.error("Failed to save song after token refresh:", retryData.error);
            localStorage.removeItem('spotifyToken');
            navigate('/login');
          }
        } else {
          console.error("Failed to refresh token:", refreshData.error);
          localStorage.removeItem('spotifyToken');
          navigate('/login');
        }
      } else {
        console.error("Failed to save song:", data.error);
      }
    } catch (err) {
      console.error("Error saving song:", err);
      navigate('/login');
    }
  }

  return (
    <div className="App">
      <Container>
        {selectedTrack && (
          <Card className="mb-3">
            <Row className="g-0">
              <Col md={4}>
                <Card.Img
                  src={selectedTrack.album.images[0]?.url}
                  alt="Track Cover"
                  style={{ height: '100%', objectFit: 'cover' }}
                />
              </Col>
              <Col md={8} className="d-flex align-items-center">
                <Card.Body>
                  <Card.Title>{selectedTrack.name}</Card.Title>
                  <Card.Text>
                    <strong>Artists:</strong>{" "}
                    {selectedTrack.artists.map(artist => artist.name).join(', ')}<br />
                    <strong>Runtime:</strong>{" "}
                    {Math.floor(selectedTrack.duration_ms / 60000)}:
                    {(Math.floor(selectedTrack.duration_ms / 1000) % 60).toString().padStart(2, '0')} minutes
                  </Card.Text>
                  <Button className="select-btn" onClick={() => handle(selectedTrack)}>
                    Select
                  </Button>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        )}

        <InputGroup className="mb-3" size="lg">
          <FormControl
            className="search-bar"
            placeholder="Search For Song"
            value={searchInput}
            onChange={event => {
              setIsTyping(true);
              setSearchInput(event.target.value);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                const topSuggestion = suggestions[0];
                if (selectedTrack) {
                  search(selectedTrack.id);
                } else if (topSuggestion) {
                  setSelectedTrack(topSuggestion);
                  setSearchInput(topSuggestion.name);
                  search(topSuggestion.id);
                }
                setShowSuggestions(false);
                setIsTyping(false);
              }
            }}
          />
          <Button
            className="search-btn"
            onClick={() => {
              setShowSuggestions(false);
              setIsTyping(false);
              if (selectedTrack) {
                search(selectedTrack.id);
              } else if (suggestions.length > 0) {
                const topSuggestion = suggestions[0];
                setSelectedTrack(topSuggestion);
                setSearchInput(topSuggestion.name);
                search(topSuggestion.id);
              }
            }}
          >
            Search
          </Button>
        </InputGroup>

        {suggestions.length > 0 && showSuggestions && (
          <div className="position-absolute bg-white border w-100 rounded shadow-sm" style={{ zIndex: 1000 }}>
            {suggestions.map(track => (
              <div
                key={track.id}
                onClick={() => {
                  setSelectedTrack(track);
                  setSearchInput(track.name);
                  setSuggestions([]);
                  setShowSuggestions(false);
                  setIsTyping(false);
                  search(track.id);
                }}
                className="p-2 hover-bg-light border-bottom"
                style={{ cursor: 'pointer' }}
              >
                {track.name} - {track.artists[0].name}
              </div>
            ))}
          </div>
        )}
      </Container>

      {selectedTrack && topTracks.length > 0 && (
        <Container className="recommendations-container">
          <h4 className="mb-3 white-text">Other tracks from {selectedTrack.artists[0].name}</h4>
          <div className="custom-row">
            {topTracks.slice(0, 8).map((track, i) => (
              <Card 
                key={track.id || i}
                className="custom-card"
                onClick={() => {
                  setSelectedTrack(track);
                  setSearchInput(track.name);
                  setShowSuggestions(false);
                  setIsTyping(false);
                  search(track.id);
                }}
              >
                <Card.Img src={track.album.images[0]?.url} />
                <Card.Body>
                  <Card.Title>{track.name}</Card.Title>
                </Card.Body>
              </Card>
            ))}
          </div>
        </Container>
      )}
    </div>
  );
}

export default SongSelect;