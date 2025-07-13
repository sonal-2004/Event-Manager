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
  const [activeTab, setActiveTab] = useState('All');

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
      console.log('✅ Registered Events Response:', res.data);
      setRegisteredEvents(res.data);
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
          key = event?.club_name?.trim() || 'Other Clubs';
          break;
        case 'Event Type':
          key = event?.event_type?.trim() || 'Other Types';
          break;
        case 'Date':
          key = event?.date ? new Date(event.date).toLocaleDateString() : 'No Date';
          break;
        case 'Time':
          key = event?.time || 'No Time';
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
    registeredEvents.some((event) => event?.id === eventId);

  const upcomingEvents = events.filter(e => new Date(e.date) >= today);
  const pastEvents = events.filter(e => new Date(e.date) < today);

  const groupedEvents = {
    All: groupEvents(events),
    Registered: groupEvents(registeredEvents),
    Upcoming: groupEvents(upcomingEvents),
    Past: groupEvents(pastEvents)
  };

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
    const alreadyRegistered = isRegistered(event?.id);

    const dateFormatted = event?.date
      ? new Date(event.date).toLocaleDateString()
      : 'Invalid Date';

    const timeFormatted = event?.time
      ? new Date(`1970-01-01T${event.time}`).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'N/A';

    return (
      <div
        key={event?.id}
        className="bg-white border rounded-lg shadow-lg p-4 w-full max-w-sm mx-auto flex flex-col justify-between hover:shadow-xl transition"
        onClick={() => setSelectedEvent(event)}
      >
        {event?.poster && (
          <img src={event.poster} alt="Poster" className="rounded mb-3 h-48 object-contain" />
        )}
        <h3 className="text-lg font-bold">{event?.title || 'Untitled Event'}</h3>
        <p>📅 {dateFormatted} | 🕒 {timeFormatted}</p>
        <p>📍 Location: {event?.location || 'N/A'}</p>
        <p>🎓 Club: {event?.club_name || 'N/A'}</p>
        <p>📂 Type: {event?.event_type || 'N/A'}</p>
        <p className="text-gray-700 line-clamp-3 mt-2">{event?.description || 'No description.'}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRegister(event?.id, event?.title, isPastEvent);
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

  const renderTabs = () => (
    <div className="flex justify-center space-x-4 my-6 flex-wrap">
      {['All', 'Registered', 'Upcoming', 'Past'].map(tab => (
        <button
          key={tab}
          className={`px-4 py-2 rounded font-semibold border ${
            activeTab === tab
              ? 'bg-purple-600 text-white'
              : 'bg-white text-purple-700 border-purple-600'
          }`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  const renderGroupedEvents = (groupedData, isPastView = false) => {
    const entries = Object.entries(groupedData);
    if (entries.length === 0) return <p className="text-center">No events to display.</p>;

    return entries.map(([groupName, events]) => (
      <div key={groupName} className="mb-10 text-center">
        <h3 className="text-xl font-semibold text-purple-600 mb-2">{groupName}</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(event =>
            renderEventCard(event, isPastView || new Date(event?.date) < today)
          )}
        </div>
      </div>
    ));
  };

  return (
    <div>
      <Navbar />

      {/* Hero Section with Images */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 text-center">
        <h1 className="text-4xl font-extrabold">College Events Hub</h1>
        <p className="text-lg italic mt-2 text-yellow-300">
          "Discover, participate, and cherish every campus moment."
        </p>
        <div className="relative z-10 flex justify-center gap-4 flex-wrap mt-6">
          <img src="/images/event-left.png" alt="Event Left" className="h-32 w-48 object-cover rounded-xl shadow-lg" />
          <img src="/images/event-mid.jpg" alt="Event Middle" className="h-32 w-48 object-cover rounded-xl shadow-lg" />
          <img src="/images/event-right.jpg" alt="Event Right" className="h-32 w-48 object-cover rounded-xl shadow-lg" />
        </div>
      </div>

      {/* Sorting Dropdown */}
      <div className="flex justify-center my-4">
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

      {/* Tab Filters */}
      {renderTabs()}

      {/* Grouped Events View */}
      <div className="p-4 max-w-6xl mx-auto">
        {renderGroupedEvents(groupedEvents[activeTab], activeTab === 'Past')}
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
                className="rounded mb-4 h-60 object-contain mx-auto"
              />
            )}
            <h2 className="text-xl font-bold mb-2">{selectedEvent.title || 'Untitled Event'}</h2>
            <p>
              📅 {selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString() : 'N/A'} | 🕒{' '}
              {selectedEvent.time
                ? new Date(`1970-01-01T${selectedEvent.time}`).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'N/A'}
            </p>
            <p>📍 Location: {selectedEvent.location || 'N/A'}</p>
            <p>🎓 Club: {selectedEvent.club_name || 'N/A'}</p>
            <p>📂 Type: {selectedEvent.event_type || 'N/A'}</p>
            <p className="mt-3 text-gray-700 whitespace-pre-wrap">{selectedEvent.description || 'No description.'}</p>
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
