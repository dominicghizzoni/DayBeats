import './styles/CalendarPage.css';
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useLocation, useNavigate } from 'react-router-dom';

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    const errorHandler = (error, errorInfo) => {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
      setHasError(true);
    };
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return <div>Something went wrong. Please try again later.</div>;
  }
  return children;
}

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [value, setValue] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null); // 👈 new
  const location = useLocation();
  const navigate = useNavigate();
  const selectedTrack = location.state?.selectedTrack || null;

  const fetchCalendarData = async (token) => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/calendar', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          const refreshRes = await fetch('http://localhost:5000/refresh-token');
          const refreshData = await refreshRes.json();
          if (refreshRes.ok && refreshData.access_token) {
            localStorage.setItem('spotifyToken', refreshData.access_token);
            const retryRes = await fetch('http://localhost:5000/api/calendar', {
              headers: { 'Authorization': `Bearer ${refreshData.access_token}` }
            });
            const data = await retryRes.json();
            setEvents(Array.isArray(data) ? data : []);
          } else {
            localStorage.removeItem('spotifyToken');
            navigate('/login');
          }
        }
      } else {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching calendar data:", err);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('spotifyToken');
    if (token) {
      fetchCalendarData(token);
    } else {
      navigate('/login');
      setIsLoading(false);
    }
  }, [navigate]);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      const match = events.find(e => e.date === dateStr);

      if (match?.album_image_url) {
        return (
          <div style={{ height: '100%', width: '100%' }}>
            <img
              src={match.album_image_url}
              alt="Album Cover"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '4px'
              }}
            />
          </div>
        );
      }

      if (dateStr === todayStr && selectedTrack?.album?.images[0]?.url) {
        return (
          <div style={{ height: '100%', width: '100%' }}>
            <img
              src={selectedTrack.album.images[0].url}
              alt="Album Cover"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '4px'
              }}
            />
          </div>
        );
      }

      if (match) {
        return <p style={{ fontSize: '0.6rem', color: 'blue' }}>{match.track_name}</p>;
      }
    }
    return null;
  };

  const handleDayClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const match = events.find(e => e.date === dateStr);
    if (match) {
      setSelectedSong(match);
    } else {
      setSelectedSong(null);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center mt-5">
      <h2 className="white-text">Calendar</h2>
      {isLoading ? (
        <div className="loading-indicator">
          <p>Loading calendar...</p>
        </div>
      ) : (
        <ErrorBoundary>
          <Calendar
            onChange={setValue}
            value={value}
            tileContent={tileContent}
            onClickDay={handleDayClick}
          />
        </ErrorBoundary>
      )}

      {selectedSong && (
        <div className="song-card">
          <button
            className="close-button"
            onClick={() => setSelectedSong(null)}
          >
            &times;
          </button>
          <iframe
            src={`https://open.spotify.com/embed/track/${selectedSong.track_id}`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            title="Spotify Player"
            style={{ borderRadius: "8px", marginTop: "10px" }}
          ></iframe>

        </div>
      )}
    </div>
  );
}

export default CalendarPage;
