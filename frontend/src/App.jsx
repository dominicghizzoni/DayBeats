import './styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Button } from 'react-bootstrap';
import CalendarPage from './CalendarPage';
import SongSelect from './SongSelect';
import Login from './Login';
import { Routes, Route, useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <Container className="d-flex justify-content-end mt-3" style={{maxWidth: '1920px'}}>
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
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
