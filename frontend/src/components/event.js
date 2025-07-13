import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const Event = () => {
  const [events, setEvents] = useState([]);
  const [sortBy, setSortBy] = useState('');

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/student/events');
      setEvents(res.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const groupEvents = () => {
    if (!sortBy) return { All: events };

    return events.reduce((acc, event) => {
      const key = sortBy === 'date'
        ? event.date
        : sortBy === 'time'
        ? event.time
        : event[sortBy];

      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {});
  };

  const groupedEvents = groupEvents();

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />

      <header className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 overflow-hidden text-center">
        <h1 className="text-3xl text-yellow-300 font-bold">Event Dashboard</h1>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Sort Filter */}
        <div className="flex justify-center gap-4 mb-8">
          <label className="text-lg font-medium text-purple-800">Sort By:</label>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="p-2 border rounded shadow"
          >
            <option value="">None</option>
            <option value="club_name">Club Name</option>
            <option value="event_type">Event Type</option>
            <option value="date">Date</option>
            <option value="time">Time</option>
          </select>
        </div>

        {/* Grouped Events */}
        {Object.entries(groupedEvents).map(([group, items]) => (
          <div key={group} className="mb-10">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 border-b pb-2">
              {group}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((event) => (
                <div
                  key={event.id}
                  className="bg-white shadow-md rounded-lg p-4 hover:scale-[1.02] transition transform"
                >
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-2">
                    {event.description.length > 100
                      ? `${event.description.slice(0, 100)}...`
                      : event.description}
                  </p>
                  <p>
                    📅 {new Date(event.date).toLocaleDateString()} | 🕒{' '}
                    {new Date('1970-01-01T' + event.time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
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
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Campus Events. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Event;
