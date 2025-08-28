import './styles/CalendarPage.css';
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useLocation } from 'react-router-dom';

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [value, setValue] = useState(new Date());
  const location = useLocation();
  const selectedTrack = location.state?.selectedTrack || null;


  useEffect(() => {
    fetch('http://localhost:5000/api/calendar')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error("Error fetching calendar data:", err));
  }, []);


  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];

      if (dateStr === todayStr && selectedTrack && selectedTrack.album?.images[0]?.url) {
        return (
          <div style={{ height: '100%', width: '100%'}}>
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
        )
      }

      const match = events.find(e => e.date === dateStr);
      if (match) {
        return <p style={{ fontSize: '0.6rem', color: 'blue' }}>{match.title}</p>;
      }
    }
    return null;
  };

  return (
    <div className="d-flex flex-column align-items-center mt-5">
      <h2>Calendar</h2>
      <Calendar
        onChange={setValue}
        value={value}
        tileContent={tileContent}
      />
    </div>
  );
}

export default CalendarPage;
