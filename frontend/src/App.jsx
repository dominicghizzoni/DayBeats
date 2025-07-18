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

  // Search
  async function search() {
    console.log("Search for " + searchInput);

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
            type="input"
            onKeyPress={event => {
              if (event.key == "Enter") {
                search();
              }
            }}
            onChange={event => setSearchInput(event.target.value)}
          />
          <Button onClick={search}>
            Search
          </Button>
        </InputGroup>
      </Container>
      
      <Container>
        <Row className="mx-2 row row-cols-4">
          {albums.map( (album, i) => {
            console.log(album);
            return (
              <Card>
                <Card.Img src={album.images[0].url} />
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
