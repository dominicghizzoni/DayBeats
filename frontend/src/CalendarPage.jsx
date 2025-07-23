import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [value, setValue] = useState(new Date());

  useEffect(() => {
    fetch('http://localhost:5000/api/calendar')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error("Error fetching calendar data:", err));
  }, []);


  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const match = events.find(e => e.date === dateStr);
      if (match) {
        return <p style={{ fontSize: '0.6rem', color: 'blue' }}>{match.title}</p>;
      }
    }
    return null;
  };

  return (
    <div className="d-flex flex-column align-items-center mt-4">
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
