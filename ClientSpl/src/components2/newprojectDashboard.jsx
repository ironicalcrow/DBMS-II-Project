import axios from "axios";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

// --- SVG Icon Components ---
const GraduationCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>;
const SignOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" /></svg>;

// --- Submission Card Component ---
const SubmissionCard = ({ title, type, submittedData, onSubmit }) => {
    const [inputValue, setInputValue] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (submittedData) {
            setInputValue(submittedData.presentation_file || "");
            setIsEditing(false); 
        } else {
            setInputValue("");
        }
    }, [submittedData]);

    const handleSubmit = () => {
        onSubmit(type, inputValue);
    };

    return (
        <div className="bg-slate-50/70 border border-slate-200/80 p-5 rounded-xl hover:shadow-md hover:border-sky-200 transition-all duration-200">
            <h3 className="font-bold text-slate-700 mb-3">{title}</h3>
            
            {submittedData ? (
                <div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                        <p className="text-sm font-medium text-green-800 truncate pr-4">{submittedData.presentation_file}</p>
                        <span className="text-xs font-bold text-green-700">Submitted</span>
                    </div>
                    {isEditing ? (
                        <div className="mt-4 flex gap-2">
                            <input
                                type="url"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={`Enter new ${title} URL`}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                            />
                            <button onClick={handleSubmit} className="px-4 py-2 text-sm font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition flex-shrink-0">Save</button>
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex-shrink-0">Cancel</button>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <button onClick={() => setIsEditing(true)} className="w-full px-4 py-2 text-sm font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition">
                                Update
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                     <p className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-3">Not submitted yet.</p>
                     <div className="mt-4 flex gap-2">
                        <input
                            type="url"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={`Enter ${title} URL`}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                        />
                        <button onClick={handleSubmit} className="px-4 py-2 text-sm font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition flex-shrink-0">
                            Submit
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function App() {
    const location = useLocation();
    const { team, pbl } = location?.state || {};
    const [submissions, setSubmissions] = useState({});

    useEffect(() => {
        const getSubmissions = async () => {
            if (!pbl?.pbl_id || !team?.team_id) return;
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:4000/api/pbl/${pbl.pbl_id}/team/${team.team_id}/files`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const subs = {};
                if (response.data.data.files) {
                    response.data.data.files.forEach(sub => {
                        subs[sub.presentation_type] = sub;
                    });
                }
                setSubmissions(subs);
            } catch (error) {
                console.error("Failed to fetch submissions:", error);
            }
        };
        getSubmissions();
    }, [pbl, team]);

    const handleLinkSubmit = async (type, url) => {
        if (!url) {
            alert("Please enter a URL.");
            return;
        }

        const isUpdate = !!submissions[type]; // Check if a submission for this type already exists

        try {
            const token = localStorage.getItem('token');
            const payload = { 
                pbl_id: pbl.pbl_id, 
                team_id: team.team_id, 
                file_link: url, 
                presentation_type: type 
            };

            if (isUpdate) {
              
                await axios.put(`http://localhost:4000/api/pbl/file-update`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert(`Link updated successfully!`);
            } else {
                
                await axios.post(`http://localhost:4000/api/pbl/file-submission`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert(`Link submitted successfully!`);
            }
            
            window.location.reload();
        } catch (error) {
            console.error(`Failed to process link for type ${type}:`, error);
            alert(`Error: ${error.response?.data?.message || 'Request failed.'}`);
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-blue-100 font-sans">
            <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 text-white rounded-xl flex items-center justify-center shadow-md">
                                <GraduationCapIcon />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 tracking-tight">SPL Automation System</h1>
                                <p className="text-sm text-slate-500">Student Dashboard</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-100 hover:text-sky-600 transition-colors duration-200">
                            <SignOutIcon />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200/50">
                    <div className="border-b border-slate-200 pb-4 mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Presentation & Link Submissions</h2>
                        <p className="text-sm text-slate-500 mt-1">Manage all your required submissions for the SPL.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SubmissionCard 
                            title="Proposal Presentation Link" 
                            type={1} 
                            submittedData={submissions[1]} 
                            onSubmit={handleLinkSubmit}
                        />
                         <SubmissionCard 
                            title="Progress Presentation Link" 
                            type={2} 
                            submittedData={submissions[2]} 
                            onSubmit={handleLinkSubmit}
                        />
                         <SubmissionCard 
                            title="Final Presentation Link" 
                            type={3} 
                            submittedData={submissions[3]} 
                            onSubmit={handleLinkSubmit}
                        />
                        <SubmissionCard 
                            title="YouTube Link" 
                            type={4} 
                            submittedData={submissions[4]} 
                            onSubmit={handleLinkSubmit}
                        />
                         <SubmissionCard 
                            title="GitHub Link" 
                            type={5} 
                            submittedData={submissions[5]} 
                            onSubmit={handleLinkSubmit}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}