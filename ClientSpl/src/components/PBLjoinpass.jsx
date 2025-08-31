import React, { useState } from 'react';

// SVG Icon for Password Visibility Toggle
const EyeIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
);

// Password Entry Form Component
const HackathonEntryForm = () => {
    // State to manage the password input
    const [password, setPassword] = useState('');
    // State for password visibility
    const [showPassword, setShowPassword] = useState(false);
    // State for handling submission messages (e.g., success or error)
    const [message, setMessage] = useState('');

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real application, you would verify the password against a backend.
        console.log('Password submitted:', password);
        
        // Mock validation logic
        if (password === 'correct_password') { // Example correct password
            setMessage({ text: 'Success! Entering hackathon...', type: 'success' });
        } else {
            setMessage({ text: 'Incorrect password. Please try again.', type: 'error' });
        }

        // Clear the message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
        setPassword('');
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg animate-fade-in"> 
            {/* Form Header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold" style={{ color: '#4060C1' }}>PBL Portal</h1>
                <p className="text-gray-600 mt-2">Enter the password to access the event.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password Input */}
                <div>
                    <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2 sr-only">Event Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter event password"
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-800"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        className="w-full font-semibold py-3 px-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 hover:brightness-90"
                        style={{ backgroundColor: '#4060C1' }}>
                        Enter
                    </button>
                </div>
            </form>
            
            {/* Submission Message Area */}
            {message && (
                 <div className={`mt-6 p-4 text-center rounded-lg ${message.type === 'success' ? 'text-green-800 bg-green-100 border border-green-400' : 'text-red-800 bg-red-100 border border-red-400'}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

// Main App Component to render the page
export default function App() {
    const customStyles = `
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
    `;
    
    return (
        <div className="text-gray-800 flex items-center justify-center min-h-screen p-4 font-sans" style={{ backgroundColor: '#E9F0FF' }}>
            <style>{customStyles}</style>
            <HackathonEntryForm />
        </div>
    );
}
