import React, { useState } from 'react';

// You would typically install these icons from a library like lucide-react
// For this self-contained example, we'll create a simple SVG component.

const MessageSquareText = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M13 8H7" />
    <path d="M17 12H7" />
  </svg>
);

// The main Notification Item Component
const NotificationItem = ({ id, title, description, time, read, onToggleRead ,notification}) => {
  const baseClasses = "flex items-start p-4 w-full rounded-lg transition-colors duration-200 ease-in-out";
  const readClasses = read ? "bg-white hover:bg-gray-50" : "bg-blue-50 hover:bg-blue-100";

  return (
    <div className={`${baseClasses} ${readClasses}`}>
      <div className="flex-shrink-0 mr-4">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
          <MessageSquareText className="w-6 h-6 text-blue-500" />
        </div>
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{notification}</p>
        <span className="text-xs text-gray-400 mt-2 block">{time}</span>
      </div>
      <div className="flex-shrink-0 ml-4">
        <button
          onClick={() => onToggleRead(id)}
          title={read ? "Mark as unread" : "Mark as read"}
          className="w-3 h-3 rounded-full bg-blue-500 transition-opacity duration-200"
          style={{ opacity: read ? 0 : 1 }}
        ></button>
      </div>
    </div>
  );
};

// Main App Component (Notification Page)
export default function App() {
  const [notifications, setNotifications] = useState([
    'this is a demo notification'
  ]);

  const handleToggleRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };
  
  


  return (
    <div className="bg-[#E9F0FF] min-h-screen font-sans text-gray-800">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <main>
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onToggleRead={handleToggleRead}
                />
              ))}
            </div>
             {notifications.length === 0 && (
                <div className="text-center p-12 text-gray-500">
                    <MessageSquareText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold">No Messages</h3>
                    <p className="text-sm">You have no new messages.</p>
                </div>
             )}
          </main>
        </div>
      </div>
    </div>
  );
}

