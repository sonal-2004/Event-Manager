import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const sortOptions = {
  none: 'All Events',
  club_name: 'Club Name',
  event_type: 'Event Type',
  date: 'Date',
  time: 'Time',
};

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sortBy, setSortBy] = useState('none');

  useEffect(() => {
    fetchEvents();
    fetchRegisteredEvents();
  }, []);

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

  const today = new Date();

  const handleRegister = async (eventId, eventTitle, isPastEvent) => {
    if (isPastEvent) {
      alert("⏳ You cannot register, the deadline has passed.");
      return;
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

  const sortEvents = (eventsList) => {
    const grouped = {};

    eventsList.forEach((event) => {
      let key;
      if (sortBy === 'none') {
        key = 'All Events';
      } else if (sortBy === 'date') {
        key = new Date(event.date).toLocaleDateString();
      } else {
        key = event[sortBy] || 'Unknown';
      }

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(event);
    });

    return grouped;
  };

  const upcomingEvents = events.filter((e) => new Date(e.date) >= today);
  const groupedEvents = sortEvents(upcomingEvents);

  const renderEventCard = (event) => (
    <div
      key={event.id}
      className="bg-white border rounded-lg shadow-md p-4 w-full max-w-sm mx-auto cursor-pointer"
      onClick={() => setSelectedEvent(event)}
    >
      {event.poster && (
        <img
          src={event.poster}
          alt="Poster"
          className="rounded mb-2 max-h-48 object-contain w-full"
        />
      )}
      <h3 className="text-xl font-bold">{event.title}</h3>
      <p>
        📅 {new Date(event.date).toLocaleDateString()} | 🕒{' '}
        {new Date('1970-01-01T' + event.time).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
      <p>📍 Location: {event.location}</p>
      <p>🎓 Club: {event.club_name}</p>
      <p>📂 Type: {event.event_type}</p>
      <p className="text-sm text-gray-700 mt-2">{event.description?.slice(0, 100)}...</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRegister(event.id, event.title, false);
        }}
        disabled={registeredEvents.includes(event.id)}
        className={`mt-4 w-full py-2 rounded ${
          registeredEvents.includes(event.id)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 text-white'
        }`}
      >
        {registeredEvents.includes(event.id) ? 'Registered' : 'Register'}
      </button>
    </div>
  );

  return (
    <div>
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 text-center">
        <h1 className="text-4xl font-extrabold">College Events Hub</h1>
        <p className="text-lg italic mt-2 text-yellow-300">
          "Discover, participate, and cherish every campus moment."
        </p>
      </div>

      {/* Sort Dropdown */}
      <div className="flex justify-center my-6">
        <label className="mr-2 text-purple-700 font-semibold">Sort By:</label>
        <select
          className="border px-3 py-2 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {Object.entries(sortOptions).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Grouped Events */}
      <div className="space-y-12 px-6 pb-12">
        {Object.entries(groupedEvents).map(([group, events]) => (
          <div key={group}>
            <h2 className="text-2xl font-bold text-purple-800 mb-4">{group}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => renderEventCard(event))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setSelectedEvent(null)}
            >
              ✕
            </button>
            {selectedEvent.poster && (
              <img
                src={selectedEvent.poster}
                alt="Poster"
                className="rounded mb-4 max-h-60 object-contain mx-auto"
              />
            )}
            <h2 className="text-xl font-bold mb-2">{selectedEvent.title}</h2>
            <p>
              📅 {new Date(selectedEvent.date).toLocaleDateString()} | 🕒{' '}
              {new Date('1970-01-01T' + selectedEvent.time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p>📍 Location: {selectedEvent.location}</p>
            <p>🎓 Club: {selectedEvent.club_name}</p>
            <p>📂 Type: {selectedEvent.event_type}</p>
            <div className="mt-3 text-gray-700 whitespace-pre-wrap">
              {selectedEvent.description}
            </div>
          </div>
        </div>
      )}

      <footer className="bg-purple-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Campus Events. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default StudentEvents;
