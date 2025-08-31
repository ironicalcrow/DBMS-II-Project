import React, { useState } from 'react';
import { userContext } from '../hooks/AutoAuth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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


// Main Form Component
const PBLForm = () => {
    const navigateto = useNavigate()
    // State to manage form inputs, now with rule book as a string
    const {User} = userContext()
    const [formData, setFormData] = useState({
        pbl_name: '',
        pbl_rule_book: '', // Changed from null to empty string
        proposal_Date: '',
        progress_date: '',
        final_presentation: '',
        student_pass: '',
        judge_pass: '',
        supervisor_pass: '',
    });

    // State for managing visibility of multiple passwords
    const [showPassword, setShowPassword] = useState({
        student: false,
        judge: false,
        supervisor: false,
    });
    
    // State for submission message
    const [submitted, setSubmitted] = useState(false);

    // Simplified handleChange for text-based inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };
    
    // Toggle password visibility for a specific field
    const togglePasswordVisibility = (field) => {
        setShowPassword(prevState => ({
            ...prevState,
            [field]: !prevState[field]
        }));
    };

    // Handle form submission
    const handleSubmit = async(e) => {
        e.preventDefault();
        const token  = localStorage.getItem('token')
        console.log('PBL Data Submitted:', formData);
        setSubmitted(true);
        const response = await axios.post('http://localhost:4000/api/pbl/host', formData, {
                headers: { Authorization: `Bearer ${token}` },
            })
        console.log(response.data.data)  
        spldata
        navigateto('/newspladminpage',{state:{spldata}})
          
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
            {/* Form Header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold" style={{ color: '#4060C1' }}>Create Your PBL</h1>
                <p className="text-gray-600 mt-2">Fill out the details below to get your event started.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* PBL Name */}
                <div>
                    <label htmlFor="pbl_name" className="block text-base font-medium text-gray-700 mb-2">PBL Name</label>
                    <input
                        type="text"
                        id="pbl_name"
                        name="pbl_name"
                        value={formData.pbl_name}
                        onChange={handleChange}
                        placeholder="e.g., AI Innovation Challenge"
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                    />
                </div>

                {/* --- START: MODIFIED RULE BOOK INPUT --- */}
                <div>
                    <label htmlFor="pbl_rule_book" className="block text-base font-medium text-gray-700 mb-2">Rule Book URL</label>
                    <input
                        type="url"
                        id="pbl_rule_book"
                        name="pbl_rule_book"
                        value={formData.pbl_rule_book}
                        onChange={handleChange}
                        placeholder="https://example.com/rules.pdf"
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                    />
                </div>
                {/* --- END: MODIFIED RULE BOOK INPUT --- */}

                {/* Dates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="proposal_Date" className="block text-base font-medium text-gray-700 mb-2">Proposal Presentation</label>
                        <input
                            type="date"
                            id="proposal_Date"
                            name="proposal_Date"
                            value={formData.proposal_Date}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                        />
                    </div>
                    <div>
                        <label htmlFor="progress_date" className="block text-base font-medium text-gray-700 mb-2">Progress Presentation</label>
                        <input
                            type="date"
                            id="progress_date"
                            name="progress_date"
                            value={formData.progress_date}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="final_presentation" className="block text-base font-medium text-gray-700 mb-2">Final Presentation</label>
                        <input
                            type="date"
                            id="final_presentation"
                            name="final_presentation"
                            value={formData.final_presentation}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                        />
                    </div>
                </div>

                {/* Password Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Student Password */}
                    <div>
                        <label htmlFor="student_pass" className="block text-base font-medium text-gray-700 mb-2">Student Password</label>
                        <div className="relative">
                            <input
                                type={showPassword.student ? 'text' : 'password'}
                                id="student_pass"
                                name="student_pass"
                                value={formData.student_pass}
                                onChange={handleChange}
                                placeholder="Password for students"
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg pr-12"
                            />
                            <button type="button" onClick={() => togglePasswordVisibility('student')} className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                {showPassword.student ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    {/* Judge Password */}
                    <div>
                        <label htmlFor="judge_pass" className="block text-base font-medium text-gray-700 mb-2">Judge Password</label>
                        <div className="relative">
                            <input
                                type={showPassword.judge ? 'text' : 'password'}
                                id="judge_pass"
                                name="judge_pass"
                                value={formData.judge_pass}
                                onChange={handleChange}
                                placeholder="Password for judges"
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg pr-12"
                            />
                            <button type="button" onClick={() => togglePasswordVisibility('judge')} className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                {showPassword.judge ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    {/* Supervisor Password */}
                    <div className="md:col-span-2">
                        <label htmlFor="supervisor_pass" className="block text-base font-medium text-gray-700 mb-2">Supervisor Password</label>
                        <div className="relative">
                            <input
                                type={showPassword.supervisor ? 'text' : 'password'}
                                id="supervisor_pass"
                                name="supervisor_pass"
                                value={formData.supervisor_pass}
                                onChange={handleChange}
                                placeholder="Password for supervisors"
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg pr-12"
                            />
                            <button type="button" onClick={() => togglePasswordVisibility('supervisor')} className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                {showPassword.supervisor ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div>
                    <button type="submit" 
                            className="w-full font-semibold py-3 px-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 hover:brightness-90"
                            style={{ backgroundColor: '#4060C1' }}>
                        Create PBL
                    </button>
                </div>
            </form>
            {/* Submission Success Message */}
            {submitted && (
                <div className="mt-6 p-4 text-center text-green-800 bg-green-100 border border-green-400 rounded-lg">
                    PBL created successfully! The form will reset shortly.
                </div>
            )}
        </div>
    );
};

// Main App Component to Render the Form
export default function App() {
    return (
        <div className="text-gray-800 flex items-center justify-center min-h-screen p-4 font-sans" style={{ backgroundColor: '#E9F0FF' }}>
            <PBLForm />
        </div>
    );
}
