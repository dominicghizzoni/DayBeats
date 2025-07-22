import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Col, Card } from 'react-bootstrap';
import { useState, useEffect } from 'react';

const CLIENT_ID = "3bc2dd711ea543b0b9c038e4ecea46fd";
const CLIENT_SECRET = "af7bdcd41b5645549c6abeace0503288";

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [topTracks, setTracks] = useState([]);

  const [suggestions, setSuggestions] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const auth = btoa(CLIENT_ID + ":" + CLIENT_SECRET);
    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + auth,
      },
      body: 'grant_type=client_credentials',
    })
      .then(response => response.json())
      .then(data => setAccessToken(data.access_token))
      .catch(error => console.error("Token Error:", error));
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchInput.length > 0 && accessToken) {
        fetch(`https://api.spotify.com/v1/search?q=${searchInput}&type=track&limit=5`, {
          headers: {
            'Authorization': 'Bearer ' + accessToken
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.tracks && data.tracks.items) {
              setSuggestions(data.tracks.items);
              setShowSuggestions(true);
            }
          });
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchInput, accessToken]);

  async function search(trackID) {
    if (!trackID) return;

    setSuggestions([]);
    setShowSuggestions(false);

    const searchHeaders = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    };

    const trackInfo = await fetch(`https://api.spotify.com/v1/tracks/${trackID}`, searchHeaders)
      .then(res => res.json());

    setSelectedTrack(trackInfo);

    const artistID = trackInfo.artists[0].id;

    const topTracksData = await fetch(`https://api.spotify.com/v1/artists/${artistID}/top-tracks?market=US`, searchHeaders)
      .then(res => res.json());

    setTracks(topTracksData.tracks);
  }

  return (
    <div className="App">
      <Container>
        {selectedTrack && (
          <Card className="mb-3">
            <Row className="g-0">
              <div className="col-md-4">
                <Card.Img
                  src={selectedTrack.album.images[0]?.url}
                  alt="Track Cover"
                  style={{ height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="col-md-8 d-flex align-items-center">
                <Card.Body>
                  <Card.Title>{selectedTrack.name}</Card.Title>
                  <Card.Text>
                    <strong>Artists:</strong>{" "}
                    {selectedTrack.artists.map(artist => artist.name).join(', ')}<br />
                    <strong>Runtime:</strong>{" "}
                    {Math.floor(selectedTrack.duration_ms / 60000)}:
                    {(Math.floor(selectedTrack.duration_ms / 1000) % 60).toString().padStart(2, '0')} minutes
                  </Card.Text>
                </Card.Body>
              </div>
            </Row>
          </Card>
        )}

        <InputGroup className="mb-3" size="lg">
          <FormControl
            placeholder="Search For Song"
            value={searchInput}
            onChange={event => {
              setSearchInput(event.target.value);
              setSelectedTrack(null);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                const topSuggestion = suggestions[0];
                if (topSuggestion) {
                  setSearchInput(topSuggestion.name);
                  setSelectedTrack(topSuggestion);
                  search(topSuggestion.id);
                  setShowSuggestions(false);
                }
              }
            }}
          />
          <Button onClick={() => selectedTrack && search(selectedTrack.id)}>
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
      <Container>
        <h4 className="mb-3">Other tracks from {selectedTrack.artists[0].name}</h4>
        <Row className="mx-2 row-cols-4 g-3">
          {topTracks.slice(0,8).map((track, i) => (
            <Card key={track.id || i} className="m-2">
              <Card.Img src={track.album.images[0]?.url} />
              <Card.Body>
                <Card.Title>{track.name}</Card.Title>
              </Card.Body>
            </Card>
          ))}
        </Row>
      </Container>
    )}
    </div>
  );
}

export default App;
