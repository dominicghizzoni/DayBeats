import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap'; 
import { useState, useEffect } from 'react';

const CLIENT_ID = '3bc2dd711ea543b0b9c038e4ecea46fd';
const CLIENT_SECRET = 'af7bdcd41b5645549c6abeace0503288';

function App() {
  const [searchInput, setSearchInput] = useState("");

  return (
    <div className="App">
      <Container>
        <InputGroup className="mb-3" size="lg">
          <FormControl
            placeholder="Search For Artist"
            type="input"
            onKeyPress={event => {
              if (event.key == "Enter") {
                console.log("Pressed enter");
              }
            }}
            onChange={event => setSearchInput(event.target.value)}
          />
          <Button onClick={event => { console.log("Clicked Button")}}>
            search
          </Button>
        </InputGroup>
      </Container>
    </div>
  );
}

export default App;
