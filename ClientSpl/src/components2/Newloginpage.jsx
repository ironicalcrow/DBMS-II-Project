import React, { useState } from "react";
// The useNavigate hook is used for programmatic navigation
import { useNavigate } from "react-router-dom";

// The main component for the Login Page
export default function App() {
    // State to hold the selected user role, defaults to 'admin'
    const [role, setRole] = useState("admin");
    // State to hold the user's email input
    const [email, setEmail] = useState("");
    // State to hold the user's password input
    const [password, setPassword] = useState("");

    // Hook to get the navigation function
    const navigate = useNavigate();

    // Handles the form submission event
    const handleSubmit = (e) => {
        // Prevents the default form submission behavior (page reload)
        e.preventDefault();

        // --- Authentication Logic Placeholder ---
        // In a real application, you would send the email, password, and role
        // to a backend server here to verify the credentials.
        console.log("Attempting to log in with:", { email, password, role });
        // For this example, we will navigate based on the selected role directly.

        // Navigate to different dashboards based on the selected role
        if (role === "student") {
            navigate("/student-personal");
        } else if (role === "supervisor") {
            navigate("/supervisor-dashboard");
        } else if (role === "admin") {
            // This is the path you mentioned might not be working.
            // Ensure you have a <Route path="/SPLadmin" element={<YourAdminComponent />} />
            // set up in your main router configuration (e.g., App.js).
            navigate("/SPLadmin");
        } else if (role === "evaluator") {
            navigate("/Eval");
        }
    };

    // The JSX for rendering the login page
    return (
        // Main container with a gradient background, covering the full screen
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center font-sans">

            {/* Header section with logo and title */}
            <header className="mt-12 mb-5 text-center">
                <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                    {/* SVG Logo */}
                    <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="20" fill="#22BAF2"/>
                        <path d="M24 14L40 22L24 30L8 22L24 14Z" fill="white"/>
                        <path d="M24 30V36" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M16 26V32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M32 26V32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </div>
                <h1 className="text-4xl font-bold text-gray-800 tracking-tight">SPL Automation System</h1>
                <p className="text-gray-500 mt-1">Software Project Lab Management</p>
            </header>

            {/* Login form card */}
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-8 mx-4 sm:mx-0 mb-12">
                <form onSubmit={handleSubmit} className="w-full">
                    <h2 className="text-center text-3xl font-semibold text-gray-800 mb-1">Log In</h2>
                    <p className="text-center text-gray-500 mb-6">Enter your credentials</p>

                    {/* Role Selection */}
                    <div>
                        <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                        <select
                            id="role-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            required
                        >
                            <option value="admin">Admin (SPL In-Charge)</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="evaluator">Evaluator</option>
                            <option value="student">Student</option>
                        </select>
                    </div>

                    {/* Email Input */}
                    <div className="mt-5">
                        <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                {/* User Icon SVG */}
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none">
                                    <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.2"/>
                                    <path d="M2 16C2 13.2386 5.58172 11 10 11C14.4183 11 18 13.2386 18 16" stroke="currentColor" strokeWidth="1.2"/>
                                </svg>
                            </span>
                            <input
                                id="email-input"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="mt-5">
                        <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                {/* Lock Icon SVG */}
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none">
                                    <rect x="4" y="9" width="12" height="7" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                                    <path d="M10 13V15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                                    <path d="M7 9V7C7 5.34315 8.34315 4 10 4C11.6569 4 13 5.34315 13 7V9" stroke="currentColor" strokeWidth="1.2"/>
                                </svg>
                            </span>
                            <input
                                id="password-input"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full mt-6 bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Login
                    </button>

                </form>
            </div>
        </div>
    );
}
