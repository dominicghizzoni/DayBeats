import './styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Button, Navbar } from 'react-bootstrap';
import CalendarPage from './CalendarPage';
import SongSelect from './SongSelect';
import Login from './Login';
import { Routes, Route, useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <Navbar className="top-bar" fixed="top">
        <Container className="justify-content-end">
          <Button variant="outline-primary" onClick={() => navigate("/calendar")}>
            View Calendar
          </Button>
          <Button variant="outline-primary" onClick={() => navigate("/")}>
            Song Select
          </Button>
        </Container>
      </Navbar>

    <div style={{ paddingTop: "70px" }}>
      <Routes>
        <Route path="/" element={<SongSelect />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      </div>
    </div>
  );
}

export default App;
