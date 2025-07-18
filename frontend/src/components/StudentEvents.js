import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [user, setUser] = useState(null);
  const [header, setHeader] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/auth/login/success');
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await axios.get('/events');
        setEvents(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchRegisteredEvents = async () => {
      if (user?.role === 'student') {
        try {
          const res = await axios.get(`/students/${user._id}/events`);
          setRegisteredEvents(res.data);
        } catch (err) {
          console.log(err);
        }
      }
    };

    fetchUser();
    fetchEvents();
    fetchRegisteredEvents();
  }, [user]);

  const handleRegister = async (eventId) => {
    if (!user || user.role !== 'student') {
      window.location.href = '/login';
      return;
    }
    try {
      await axios.post(`/students/${user._id}/register/${eventId}`);
      alert('Registered successfully');
      const res = await axios.get(`/students/${user._id}/events`);
      setRegisteredEvents(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    const now = new Date();

    if (activeTab === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.date) >= now);
    } else if (activeTab === 'past') {
      filtered = filtered.filter(event => new Date(event.date) < now);
    } else if (activeTab === 'registered') {
      filtered = registeredEvents;
    }

    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      setHeader('Sorted by Date');
    } else if (sortBy === 'time') {
      filtered.sort((a, b) => a.time.localeCompare(b.time));
      setHeader('Sorted by Time');
    } else if (sortBy === 'club') {
      filtered.sort((a, b) => a.clubName.localeCompare(b.clubName));
      setHeader('Sorted by Club Name');
    } else if (sortBy === 'type') {
      filtered.sort((a, b) => a.type.localeCompare(b.type));
      setHeader('Sorted by Event Type');
    } else {
      setHeader('');
    }

    return filtered;
  };

  const renderEvents = () => {
    const filtered = filterEvents();
    if (filtered.length === 0) return <p>No events found.</p>;

    return (
      <>
        {header && <h3>{header}</h3>}
        {filtered.map(event => {
          const isRegistered = registeredEvents.some(e => e._id === event._id);
          const isPast = new Date(event.date) < new Date();

          return (
            <div key={event._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <h3>{event.name}</h3>
              <p><b>Date:</b> {new Date(event.date).toLocaleDateString()}</p>
              <p><b>Time:</b> {event.time}</p>
              <p><b>Club:</b> {event.clubName}</p>
              <p><b>Type:</b> {event.type}</p>
              {isPast ? (
                <button disabled style={{ backgroundColor: 'grey', color: 'white', cursor: 'not-allowed' }}>Deadline Gone</button>
              ) : (
                <button onClick={() => handleRegister(event._id)} disabled={isRegistered}>
                  {isRegistered ? 'Already Registered' : 'Register'}
                </button>
              )}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div>
      <Navbar />
      <h1>Events</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('all')}>All Events</button>
        <button onClick={() => setActiveTab('upcoming')}>Upcoming Events</button>
        <button onClick={() => setActiveTab('past')}>Past Events</button>
        <button onClick={() => setActiveTab('registered')}>Registered Events</button>
      </div>
      <div>
        <label>Sort By:&nbsp;</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">-- Select --</option>
          <option value="date">Date</option>
          <option value="time">Time</option>
          <option value="club">Club Name</option>
          <option value="type">Event Type</option>
        </select>
      </div>
      <div>
        {renderEvents()}
      </div>
    </div>
  );
};

export default StudentEvents;
