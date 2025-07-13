import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const EventDashboard = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState({});
  const [filterBy, setFilterBy] = useState('');
  const [filterValue, setFilterValue] = useState('');

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/student/all-events');
      setEvents(res.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (filterBy && filterValue) {
      const grouped = events.filter(e => e[filterBy] === filterValue).reduce((acc, event) => {
        const key = event[filterBy];
        if (!acc[key]) acc[key] = [];
        acc[key].push(event);
        return acc;
      }, {});
      setFilteredEvents(grouped);
    } else {
      setFilteredEvents({});
    }
  }, [filterBy, filterValue, events]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />

      <header className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 overflow-hidden text-center">
        {Array.from({ length: 25 }).map((_, index) => (
          <img
            key={index}
            src="/assets/starss.png"
            alt="Sparkle"
            className="absolute w-4 h-4 sparkle pointer-events-none"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
        <h1 className="text-3xl text-yellow-300 font-bold">Event Dashboard</h1>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <select onChange={e => { setFilterBy('club_name'); setFilterValue(e.target.value); }} className="p-2 border rounded">
            <option value="">Filter by Club</option>
            <option value="Tech Club">Tech Club</option>
            <option value="Cultural Club">Cultural Club</option>
            <option value="Literary Club">Literary Club</option>
            <option value="Sports Club">Sports Club</option>
          </select>
          <select onChange={e => { setFilterBy('event_type'); setFilterValue(e.target.value); }} className="p-2 border rounded">
            <option value="">Filter by Type</option>
            <option value="Seminar">Seminar</option>
            <option value="Workshop">Workshop</option>
            <option value="Competition">Competition</option>
            <option value="Social">Social</option>
          </select>
          <button onClick={() => { setFilterBy(''); setFilterValue(''); }} className="p-2 bg-gray-300 rounded">Clear Filter</button>
        </div>

        {Object.keys(filteredEvents).length > 0 ? (
          Object.entries(filteredEvents).map(([key, group]) => (
            <div key={key} className="mb-8">
              <h2 className="text-xl font-semibold text-purple-700 mb-4">{filterBy === 'club_name' ? `Club: ${key}` : `Type: ${key}`}</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {group.map(event => (
                  <div key={event.id} className="bg-white shadow-md rounded-lg p-4">
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-2">{event.description.length > 100 ? `${event.description.slice(0, 100)}...` : event.description}</p>
                    <p>📅 {new Date(event.date).toLocaleDateString()} | 🕒 {new Date('1970-01-01T' + event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm text-gray-500">📍 {event.location}</p>
                    {event.poster && <img src={event.poster} alt="Poster" className="rounded mt-2 max-h-40 object-contain w-full" />}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map(event => (
              <div key={event.id} className="bg-white shadow-md rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-2">{event.description.length > 100 ? `${event.description.slice(0, 100)}...` : event.description}</p>
                <p>📅 {new Date(event.date).toLocaleDateString()} | 🕒 {new Date('1970-01-01T' + event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-sm text-gray-500">📍 {event.location}</p>
                {event.poster && <img src={event.poster} alt="Poster" className="rounded mt-2 max-h-40 object-contain w-full" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-purple-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Campus Events. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default EventDashboard;
