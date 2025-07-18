import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

axios.defaults.withCredentials = true;

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/event/allevents`);
      setEvents(response.data);
      filterEvents(response.data, tab, sortBy);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const filterEvents = (allEvents, tabFilter, sortFilter) => {
    const now = new Date();
    let filtered = allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return tabFilter === 'upcoming' ? eventDate >= now : eventDate < now;
    });

    switch (sortFilter) {
      case 'date':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'type':
        filtered.sort((a, b) => a.eventType.localeCompare(b.eventType));
        break;
      case 'club':
        filtered.sort((a, b) => a.club.localeCompare(b.club));
        break;
      default:
        break;
    }

    setFilteredEvents(filtered);
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    filterEvents(events, newTab, sortBy);
  };

  const handleSortChange = (e) => {
    const selectedSort = e.target.value;
    setSortBy(selectedSort);
    filterEvents(events, tab, selectedSort);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4">
        <h2 className="text-3xl font-bold mb-4 text-center">All Events</h2>

        {/* Tabs for Upcoming / Past */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => handleTabChange('upcoming')}
            className={`px-4 py-2 rounded ${tab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => handleTabChange('past')}
            className={`px-4 py-2 rounded ${tab === 'past' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
          >
            Past Events
          </button>
        </div>

        {/* Sort By Filter */}
        <div className="flex justify-end mb-4">
          <label className="mr-2 font-medium">Sort by:</label>
          <select
            className="border px-3 py-2 rounded shadow"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="">None</option>
            <option value="date">Date/Time</option>
            <option value="type">Event Type</option>
            <option value="club">Club</option>
          </select>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event._id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">{event.title}</h3>
              <p className="text-gray-600">{new Date(event.date).toLocaleString()}</p>
              <p className="mt-1">Type: {event.eventType}</p>
              <p>Club: {event.club}</p>
              <p className="mt-2 text-sm text-gray-700">{event.description}</p>
            </div>
          ))}
        </div>

        {/* No Events */}
        {filteredEvents.length === 0 && (
          <div className="text-center mt-10 text-gray-500">
            No events found for this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEvents;
