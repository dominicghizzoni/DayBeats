import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap'; 
import { useState, useEffect } from 'react';

const CLIENT_ID = "3bc2dd711ea543b0b9c038e4ecea46fd";
const CLIENT_SECRET = "af7bdcd41b5645549c6abeace0503288";

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);

  const [suggestions, setSuggestions] = useState([]);
  const [selectedArtists, setSelectedArtist] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

useEffect(() => {
  // API Access Token
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
    .then(data => {
      setAccessToken(data.access_token);
    })
    .catch(error => console.error("Token Error:", error));
}, []);

useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    if (searchInput.length > 0) {
      fetch(`https://api.spotify.com/v1/search?q=${searchInput}&type=artist&limit=5`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.artists && data.artists.items) {
            setSuggestions(data.artists.items);
          }
        });
  } else {
    setSuggestions([]);
  }
  }, 300);

  return () => clearTimeout(delayDebounceFn);
}, [searchInput, accessToken]);

  // Search
  async function search(artistID) {
    if (!artistID) return;
    setSuggestions([]);

    // Get request using search to get artist ID
    var searchParameters = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      }
    }
    var artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist' , searchParameters)
      .then(response => response.json())
      .then(data => { return data.artists.items[0].id })

    console.log("Artist ID is " + artistID);
    
    var returnedAlbums = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?include_groups=album&market=US&limit=50', searchParameters)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setAlbums(data.items);
      })
  }
  console.log(albums);
  return (
    <div className="App">
      <Container>
        <InputGroup className="mb-3" size="lg">
          <FormControl
            placeholder="Search For Artist"
            value={searchInput}
            onChange={event => {
              setSearchInput(event.target.value);
              setSelectedArtist(null);
            }}
            onFocus={() => setShowSuggestions(true)} 
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                const artistToSearch = selectedArtists || suggestions[0];
                if (artistToSearch) {
                  setSelectedArtist(artistToSearch);
                  setSearchInput(artistToSearch.name);
                  setSuggestions([]);
                  setShowSuggestions(false);
                  search(artistToSearch.id);
                }
            }
          }}
          />
          <Button onClick={() => selectedArtist && search(selectedArtist.id)}>
            Search
          </Button>
        </InputGroup>

        {suggestions.length > 0 && showSuggestions && (
          <div className="position-absolute bg-white border w-100 rounded shadow-sm" style={{ zIndex: 1000 }}>
            {suggestions.map(artist => (
              <div
                key={artist.id}
                onClick={() => {
                  setSelectedArtist(artist);
                  setSearchInput(artist.name);
                  setSuggestions([]);
                  search(artist.id);
                }}
                className="p-2 hover-bg-light border-bottom"
                style={{ cursor: 'pointer' }}
              >
                {artist.name}
              </div>
            ))}
          </div>
        )}
      </Container>
      
      <Container>
        <Row className="mx-2 row row-cols-4">
          {albums.map( (album, i) => {
            console.log(album);
            return (
              <Card>
                <Card.Img src={album.images[0]?.url} />
                <Card.Body>
                  <Card.Title>{album.name}</Card.Title>
                </Card.Body>
              </Card>
            )
          })}
        </Row>
      </Container>
    </div>
  );
}

export default App;
