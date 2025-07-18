import React, { useEffect, useState } from "react";
import axios from "axios";

export default function StudentEvents() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [sortKey, setSortKey] = useState("date");

  const studentId = localStorage.getItem("studentId"); // make sure it's set on login

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortEvents();
  }, [events, activeTab, sortKey, registeredEventIds]);

  const fetchData = async () => {
    try {
      const [eventsRes, registeredRes] = await Promise.all([
        axios.get("/api/events"),
        axios.get(`/api/registrations/${studentId}`),
      ]);
      setEvents(eventsRes.data);
      setRegisteredEventIds(registeredRes.data.map(reg => reg.eventId));
    } catch (error) {
      console.error("Error loading events or registrations", error);
    }
  };

  const filterAndSortEvents = () => {
    let filtered = [...events];
    const now = new Date();

    if (activeTab === "Upcoming") {
      filtered = filtered.filter(event => new Date(event.date) >= now);
    } else if (activeTab === "Past") {
      filtered = filtered.filter(event => new Date(event.date) < now);
    } else if (activeTab === "Registered") {
      filtered = filtered.filter(event => registeredEventIds.includes(event._id));
    }

    filtered.sort((a, b) => {
      if (sortKey === "date") return new Date(a.date) - new Date(b.date);
      if (sortKey === "time") return (a.time || "").localeCompare(b.time || "");
      if (sortKey === "club") return (a.club || "").localeCompare(b.club || "");
      if (sortKey === "type") return (a.type || "").localeCompare(b.type || "");
      return 0;
    });

    setFilteredEvents(filtered);
  };

  const handleRegister = async (eventId) => {
    try {
      await axios.post("/api/registrations", {
        studentId,
        eventId,
      });
      setRegisteredEventIds([...registeredEventIds, eventId]);
    } catch (err) {
      console.error("Registration failed", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Explore Events</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {["All", "Registered", "Upcoming", "Past"].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full text-sm font-semibold shadow ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sort Dropdown */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Sort by:</label>
        <select
          className="border px-3 py-1 rounded"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
        >
          <option value="date">Date</option>
          <option value="time">Time</option>
          <option value="club">Club</option>
          <option value="type">Type</option>
        </select>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredEvents.length === 0 ? (
          <p className="text-gray-500">No events to show.</p>
        ) : (
          filteredEvents.map(event => {
            const isRegistered = registeredEventIds.includes(event._id);
            return (
              <div
                key={event._id}
                className="bg-white p-5 rounded-lg border shadow hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold">{event.title}</h2>
                  {isRegistered && (
                    <span className="text-green-600 bg-green-100 px-2 py-0.5 text-xs rounded-full">
                      Registered
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">📅 {new Date(event.date).toLocaleDateString()} | ⏰ {event.time}</p>
                <p className="text-sm text-gray-600">📍 {event.location || "Campus"}</p>
                <p className="text-sm text-gray-600">🏷️ {event.type} | 🎓 {event.club}</p>
                <p className="text-gray-700 mt-2">{event.description}</p>
                
                {!isRegistered && (
                  <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                    onClick={() => handleRegister(event._id)}
                  >
                    Register
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
