import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const EventDashboard = () => {
  const [events, setEvents] = useState([]);
  const [sortBy, setSortBy] = useState('club_name');
  const [userRole, setUserRole] = useState('');

  const fetchEvents = async () => {
    try {
      const roleRes = await axios.get('/api/auth/role');
      const role = roleRes.data.role;
      setUserRole(role);

      const endpoint = role === 'clubAdmin' ? '/api/clubAdmin/my-events' : '/api/events';
      const res = await axios.get(endpoint);
      setEvents(res.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const groupEvents = () => {
    const grouped = {};
    events.forEach((event) => {
      let key = '';
      switch (sortBy) {
        case 'club_name':
          key = event.club_name;
          break;
        case 'event_type':
          key = event.event_type;
          break;
        case 'date':
          key = new Date(event.date).toLocaleDateString();
          break;
        case 'time':
          key = event.time;
          break;
        default:
          key = event.club_name;
      }
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupEvents();

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />

      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 text-center">
        <h1 className="text-3xl text-yellow-300 font-bold">Upcoming Events</h1>
        <div className="mt-4">
          <label htmlFor="sortBy" className="mr-2">Sort by:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 rounded text-black"
          >
            <option value="club_name">Club Name</option>
            <option value="event_type">Event Type</option>
            <option value="date">Date</option>
            <option value="time">Time</option>
          </select>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {Object.keys(groupedEvents).map((group) => (
          <div key={group} className="mb-8">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">{group}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groupedEvents[group].map((event) => (
                <div
                  key={event.id}
                  className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                >
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-2">
                    {event.description.length > 100
                      ? `${event.description.slice(0, 100)}...`
                      : event.description}
                  </p>
                  <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                  <p>🕒 {new Date('1970-01-01T' + event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-sm text-gray-500">📍 {event.location}</p>
                  {event.poster && (
                    <img
                      src={event.poster}
                      alt="Poster"
                      className="rounded mt-2 max-h-40 object-contain w-full"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="bg-purple-800 text-white py-8">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Campus Events. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default EventDashboard;
