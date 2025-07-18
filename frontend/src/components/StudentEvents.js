import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    checkAuth();
    fetchEvents();
    if (isAuthenticated) {
      fetchRegisteredEvents();
    }

    const postLoginEventId = sessionStorage.getItem("registerAfterLogin");
    if (postLoginEventId && isAuthenticated) {
      handleRegister(postLoginEventId);
      sessionStorage.removeItem("registerAfterLogin");
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/student/profile');
      if (res.status === 200) setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/events/all');
      setEvents(res.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const res = await axios.get('/api/student/registered');
      setRegisteredEvents(res.data.map(e => e.id));
    } catch (error) {
      console.error('Failed to fetch registered events:', error);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await axios.post(`/api/student/register/${eventId}`);
      alert("✅ Registration successful!");
      fetchRegisteredEvents();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.setItem("registerAfterLogin", eventId);
        window.location.href = "/login";
      } else if (error.response?.status === 400) {
        alert("ℹ You are already registered for this event.");
      } else {
        alert("❌ Registration failed.");
      }
    }
  };

  const today = new Date();
  const isPast = (date) => new Date(date) < today;

  const filteredEvents = {
    all: events,
    upcoming: events.filter(e => !isPast(e.date)),
    past: events.filter(e => isPast(e.date)),
    registered: events.filter(e => registeredEvents.includes(e.id)),
  };

  const sortedEvents = filteredEvents[selectedTab].slice().sort((a, b) => {
    if (sortBy === 'date') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'time') return new Date('1970-01-01T' + a.time) - new Date('1970-01-01T' + b.time);
    if (sortBy === 'club') return a.club_name.localeCompare(b.club_name);
    if (sortBy === 'type') return a.type?.localeCompare(b.type);
    return 0;
  });

  const renderEventCard = (event) => {
    const isPastEvent = isPast(event.date);
    const isRegistered = registeredEvents.includes(event.id);

    return (
      <div key={event.id} className="bg-white border rounded-lg shadow-md p-4 hover:shadow-xl transition">
        {event.poster && (
          <img src={event.poster} alt="Poster" className="rounded mb-2 w-full max-h-48 object-contain" />
        )}
        <h3 className="text-lg font-bold">{event.title}</h3>
        <p className="text-sm text-gray-600">📅 {new Date(event.date).toLocaleDateString()} | 🕒 {new Date('1970-01-01T' + event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        <p>📍 {event.location}</p>
        <p>🎓 {event.club_name}</p>
        {event.type && <p>🎯 {event.type}</p>}
        <p className="mt-2 text-gray-700 line-clamp-3">{event.description}</p>

        {isAuthenticated && (
          <button
            onClick={() => handleRegister(event.id)}
            disabled={isPastEvent || isRegistered}
            className={`mt-4 w-full py-2 rounded text-white ${isPastEvent || isRegistered ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isPastEvent ? 'Registration Closed' : isRegistered ? 'Registered' : 'Register'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      <Navbar />

      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-2">{isAuthenticated ? 'Student Events' : 'Login Required'}</h1>
        {!isAuthenticated && <p className="italic text-yellow-200">Please login to view and register for events.</p>}
      </div>

      {isAuthenticated ? (
        <>
          {/* Tabs */}
          <div className="flex justify-center my-6 gap-2">
            {['all', 'upcoming', 'past', 'registered'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-full border ${selectedTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Events
              </button>
            ))}
          </div>

          {/* Sort Filter */}
          <div className="flex justify-center mb-4">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded px-4 py-2">
              <option value="date">Sort by Date</option>
              <option value="time">Sort by Time</option>
              <option value="club">Sort by Club</option>
              <option value="type">Sort by Type</option>
            </select>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 mb-16">
            {sortedEvents.length > 0 ? (
              sortedEvents.map(event => renderEventCard(event))
            ) : (
              <p className="text-center col-span-full">No events to display.</p>
            )}
          </div>
        </>
      ) : (
        <div className="text-center text-lg py-20">Please <a href="/login" className="text-blue-500 underline">log in</a> to view events.</div>
      )}

      <footer className="bg-purple-800 text-white py-8 text-center">
        <p>&copy; {new Date().getFullYear()} Student Events Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default StudentEvents;
