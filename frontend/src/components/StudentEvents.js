import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sortBy, setSortBy] = useState('Club Name');

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
      setRegisteredEvents(res.data); // Now it's a list of event objects
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    }
  };

  const today = new Date();

  const groupEvents = (eventList) => {
    const grouped = {};

    eventList.forEach(event => {
      let key;
      switch (sortBy) {
        case 'Club Name':
          key = event.club_name || 'Unknown Club';
          break;
        case 'Event Type':
          key = event.event_type || 'Unknown Type';
          break;
        case 'Date':
          key = new Date(event.date).toLocaleDateString();
          break;
        case 'Time':
          key = event.time;
          break;
        default:
          key = 'Others';
      }

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(event);
    });

    return grouped;
  };

  const isRegistered = (eventId) =>
    registeredEvents.some((event) => event.id === eventId);

  const upcomingEvents = events.filter(e => new Date(e.date) >= today);
  const pastEvents = events.filter(e => new Date(e.date) < today);

  const groupedUpcoming = groupEvents(upcomingEvents);
  const groupedPast = groupEvents(pastEvents);

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

  const renderEventCard = (event, isPastEvent) => {
    const alreadyRegistered = isRegistered(event.id);

    return (
      <div
        key={event.id}
        className="bg-white border rounded-lg shadow-lg p-4 w-full max-w-sm mx-auto flex flex-col justify-between hover:shadow-xl transition"
        onClick={() => setSelectedEvent(event)}
      >
        {event.poster && (
          <img src={event.poster} alt="Poster" className="rounded mb-3 h-48 object-contain" />
        )}
        <h3 className="text-lg font-bold">{event.title}</h3>
        <p>📅 {new Date(event.date).toLocaleDateString()} | 🕒 {event.time.slice(0, 5)}</p>
        <p>📍 Location: {event.location}</p>
        <p>🎓 Club: {event.club_name}</p>
        <p>📂 Type: {event.event_type}</p>
        <p className="text-gray-700 line-clamp-3 mt-2">{event.description}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRegister(event.id, event.title, isPastEvent);
          }}
          className={`mt-4 px-4 py-2 rounded text-white ${
            isPastEvent || alreadyRegistered
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-800'
          }`}
          disabled={isPastEvent || alreadyRegistered}
        >
          {isPastEvent
            ? 'Registration Closed'
            : alreadyRegistered
            ? 'Registered'
            : 'Register'}
        </button>
      </div>
    );
  };

  return (
    <div>
      <Navbar />

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 text-center">
        <h1 className="text-4xl font-extrabold">College Events Hub</h1>
        <p className="text-lg italic mt-2 text-yellow-300">"Discover, participate, and cherish every campus moment."</p>
      </div>

      <div className="flex justify-center my-6">
        <label className="mr-2 text-purple-700 font-semibold">Sort By:</label>
        <select
          className="border px-3 py-1 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="Club Name">Club Name</option>
          <option value="Event Type">Event Type</option>
          <option value="Date">Date</option>
          <option value="Time">Time</option>
        </select>
      </div>

      {/* UPCOMING EVENTS */}
      <div className="text-center my-8">
        <h2 className="text-3xl font-bold text-purple-700 mb-4">Upcoming Events</h2>
        {Object.entries(groupedUpcoming).length === 0 ? (
          <p>No upcoming events found.</p>
        ) : (
          Object.entries(groupedUpcoming).map(([groupName, events]) => (
            <div key={groupName} className="mb-10">
              <h3 className="text-xl font-semibold text-purple-600 mb-2">{groupName}</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map(event => renderEventCard(event, false))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAST EVENTS */}
      <div className="text-center my-8">
        <h2 className="text-3xl font-bold text-purple-700 mb-4">Past Events</h2>
        {Object.entries(groupedPast).length === 0 ? (
          <p>No past events found.</p>
        ) : (
          Object.entries(groupedPast).map(([groupName, events]) => (
            <div key={groupName} className="mb-10">
              <h3 className="text-xl font-semibold text-purple-600 mb-2">{groupName}</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map(event => renderEventCard(event, true))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* EVENT MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-black" onClick={() => setSelectedEvent(null)}>✕</button>
            {selectedEvent.poster && (
              <img src={selectedEvent.poster} alt="Poster" className="rounded mb-4 h-60 object-contain mx-auto" />
            )}
            <h2 className="text-xl font-bold mb-2">{selectedEvent.title}</h2>
            <p>📅 {new Date(selectedEvent.date).toLocaleDateString()} | 🕒 {selectedEvent.time.slice(0, 5)}</p>
            <p>📍 Location: {selectedEvent.location}</p>
            <p>🎓 Club: {selectedEvent.club_name}</p>
            <p>📂 Type: {selectedEvent.event_type}</p>
            <p className="mt-3 text-gray-700 whitespace-pre-wrap">{selectedEvent.description}</p>
          </div>
        </div>
      )}

      <footer className="bg-purple-800 text-white py-8 mt-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Campus Events. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default StudentEvents;
