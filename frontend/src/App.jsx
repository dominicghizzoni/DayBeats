import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Button } from 'react-bootstrap';
import CalendarPage from './CalendarPage';
import SongSelect from './SongSelect';
import { Routes, Route, useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <Container className="d-flex justify-content-end mt-3">
        <Button variant="outline-primary" onClick={() => navigate("/calendar")}>
          View Calendar
        </Button>
        <Button variant="outline-primary" onClick={() => navigate("/")}>
         Song Select
        </Button>
      </Container>

      <Routes>
        <Route path="/" element={<SongSelect />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </div>
  );
}

export default App;
