// StudentEvents.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filterType, setFilterType] = useState('');
  const today = new Date();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setIsAuthenticated(true);
    } else {
      checkAuth();
    }
    fetchEvents();
    fetchRegisteredEvents();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/auth/check');
      setIsAuthenticated(res.data.authenticated);
    } catch (err) {
      console.error('Auth check failed:', err);
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
      setRegisteredEvents(res.data);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    }
  };

  const handleRegister = async (eventId, eventTitle, isPastEvent) => {
    if (!isAuthenticated) {
      sessionStorage.setItem("registerAfterLogin", eventId);
      return window.location.href = "/login";
    }

    if (isPastEvent) {
      return alert("⏳ You cannot register, the deadline has passed.");
    }

    try {
      await axios.post(`/api/student/register/${eventId}`);
      alert(`✅ Registered successfully for "${eventTitle}"`);
      fetchRegisteredEvents();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        sessionStorage.setItem("registerAfterLogin", eventId);
        window.location.href = "/login";
      } else if (error.response?.status === 400) {
        alert("ℹ️ You are already registered for this event.");
      } else {
        alert("❌ Registration failed.");
      }
    }
  };

  const filteredEvents = events.filter(event => {
    switch (filterType) {
      case 'date':
        return new Date(event.date).toLocaleDateString() === today.toLocaleDateString();
      case 'time':
        return !!event.time;
      case 'type':
        return event.type?.toLowerCase().includes(''); // customize if needed
      case 'club':
        return event.club_name?.toLowerCase().includes(''); // customize if needed
      default:
        return true;
    }
  });

  const upcomingEvents = filteredEvents.filter(e => new Date(e.date) >= today);
  const pastEvents = filteredEvents.filter(e => new Date(e.date) < today);
  const registered = filteredEvents.filter(e => registeredEvents.some(r => r.id === e.id));

  const renderEventCard = (event, isPastEvent = false) => (
    <div
      key={event.id}
      className="bg-white border rounded-lg shadow-lg shadow-purple-300 p-4 w-full max-w-sm mx-auto flex flex-col justify-between cursor-pointer hover:shadow-xl transition"
      onClick={() => setSelectedEvent(event)}
    >
      <div>
        {event.poster && (
          <img src={event.poster} alt="Poster" className="rounded mt-2 max-h-60 object-contain w-full mx-auto" />
        )}
        <h3 className="text-lg font-bold mt-2">{event.title}</h3>
        <p>📅 {new Date(event.date).toLocaleDateString()} | 🕒 {new Date('1970-01-01T' + event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        <p>📍 Location: {event.location}</p>
        <p>🎓 Organized By: {event.club_name}</p>
        <p className="mt-2 text-gray-700 line-clamp-3 overflow-hidden h-[4.5em]">{event.description}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRegister(event.id, event.title, isPastEvent);
        }}
        className={`mt-4 px-4 py-2 rounded transition text-white ${isPastEvent || registeredEvents.some(r => r.id === event.id) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-red-700'}`}
        disabled={isPastEvent || registeredEvents.some(r => r.id === event.id)}
      >
        {isPastEvent ? 'Registration Closed' : registeredEvents.some(r => r.id === event.id) ? 'Registered' : 'Register'}
      </button>
    </div>
  );

  return (
    <div>
      <Navbar />

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-2">College Events Hub</h1>
        <p className="italic text-yellow-300">Discover, participate, and cherish every campus moment</p>
      </div>

      <div className="flex flex-col items-center gap-4 my-8">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2 rounded border"
        >
          <option value="">Sort By</option>
          <option value="date">Date</option>
          <option value="time">Time</option>
          <option value="club">Club</option>
          <option value="type">Event Type</option>
        </select>
      </div>

      <div className="text-center my-6">
        <h2 className="text-3xl font-bold text-purple-700">Upcoming Events</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {upcomingEvents.length > 0 ? upcomingEvents.map(e => renderEventCard(e, false)) : <p>No upcoming events.</p>}
      </div>

      <div className="text-center my-6">
        <h2 className="text-3xl font-bold text-purple-700">Past Events</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pastEvents.length > 0 ? pastEvents.map(e => renderEventCard(e, true)) : <p>No past events.</p>}
      </div>

      {isAuthenticated && (
        <>
          <div className="text-center my-6">
            <h2 className="text-3xl font-bold text-purple-700">Registered Events</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registered.length > 0 ? registered.map(e => renderEventCard(e, false)) : <p>No registered events.</p>}
          </div>
        </>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setSelectedEvent(null)}
            >✕</button>
            {selectedEvent.poster && (
              <img src={selectedEvent.poster} alt="Poster" className="rounded mb-4 max-h-60 object-contain mx-auto" />
            )}
            <h2 className="text-xl font-bold mb-2">{selectedEvent.title}</h2>
            <p>📅 {new Date(selectedEvent.date).toLocaleDateString()} | 🕒 {new Date('1970-01-01T' + selectedEvent.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p>📍 Location: {selectedEvent.location}</p>
            <p>🎓 Organized By: {selectedEvent.club_name}</p>
            <div className="mt-3 text-gray-700 whitespace-pre-wrap">{selectedEvent.description}</div>
          </div>
        </div>
      )}

      <footer className="bg-purple-800 text-white py-8 mt-6 text-center">
        <p>&copy; {new Date().getFullYear()} Campus Events. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default StudentEvents;
