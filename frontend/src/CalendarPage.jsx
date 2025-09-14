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
            // Retry the calendar fetch with the new token
            const retryRes = await fetch('http://localhost:5000/api/calendar', {
              headers: {
                'Authorization': `Bearer ${refreshData.access_token}`
              }
            });
            if (!retryRes.ok) {
              throw new Error(`HTTP error! Status: ${retryRes.status}`);
            }
            const data = await retryRes.json();
            if (Array.isArray(data)) {
              setEvents(data);
            } else {
              console.error("Received non-array data from /api/calendar:", data);
              setEvents([]);
            }
          } else {
            console.error("Failed to refresh token:", refreshData.error);
            localStorage.removeItem('spotifyToken');
            navigate('/login');
          }
        } else {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
      } else {
        const data = await res.json();
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          console.error("Received non-array data from /api/calendar:", data);
          setEvents([]);
        }
      }
    } catch (err) {
      console.error("Error fetching calendar data:", err);
      setEvents([]);
    } finally {
      setIsLoading(false); // Set loading to false when done
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('spotifyToken');
    if (token) {
      fetchCalendarData(token);
    } else {
      console.error("No Spotify token found in localStorage");
      navigate('/login');
      setIsLoading(false); // Ensure loading is false if no token
    }
  }, [navigate]);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      const match = events.find(e => e.date === dateStr);

      // Render album cover art for any date with a saved song that has an image
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

      // Fallback to selectedTrack for today's date if no match is found
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

      // Fallback to track name for any date with a saved song but no image
      if (match) {
        return <p style={{ fontSize: '0.6rem', color: 'blue' }}>{match.track_name}</p>;
      }
    }
    return null;
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
          />
        </ErrorBoundary>
      )}
    </div>
  );
}

export default CalendarPage;