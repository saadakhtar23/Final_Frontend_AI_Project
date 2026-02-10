import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useSocket from '../utils/useSocket';
import { baseUrl } from '../utils/ApiConstants.jsx';

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch notifications from API on mount
  useEffect(() => {
    if (!userId) return;
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken') || localStorage.getItem('candidateToken') || localStorage.getItem('superAdminToken');
        const res = await axios.get(`${baseUrl}/notifications/get-notify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotifications(res.data);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchNotifications();
  }, [userId]);

  useSocket(userId, (data) => {
    setNotifications((prev) => [data, ...prev]);
  });

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-100"
        onClick={() => setShowDropdown((prev) => !prev)}
        aria-label="Notifications"
      >
        <svg className="w-6 h-6 text-[#6D28D9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 animate-fade-in">
          <div className="p-4 border-b font-semibold text-[#6D28D9] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#6D28D9]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            Notifications
          </div>
          <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <li className="p-6 text-gray-400 text-center">No notifications yet.</li>
            ) : (
              notifications.map((notif, idx) => (
                <li key={idx} className="p-4 flex gap-3 items-start hover:bg-gray-50 transition-all duration-200">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-[#6D28D9]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 mb-1">{notif.message}</div>
                    {/* {notif.link && (
                      <a href={notif.link} className="text-[#6D28D9] text-sm hover:underline font-semibold">View Details</a>
                    )} */}
                    <div className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
