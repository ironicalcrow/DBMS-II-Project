import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// --- SVG Icon Components (unchanged) ---
const SupervisorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const GithubIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>;
const SlidesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg>;

// TeamCard Component (unchanged)
const TeamCard = ({ team }) => (
    <div className="bg-white border border-sky-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-200 p-6">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h3 className="text-lg font-bold text-slate-800">{team.team_name}</h3>
                <p className="text-sm text-slate-500">{team.project}</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-sky-100 text-sky-700 rounded-full">{team.members.length} Members</span>
        </div>
        <div className="flex flex-wrap gap-4">
            {team.members.map((member, index) => (
                <div key={index} className="bg-gradient-to-br from-slate-50 to-sky-50 p-4 rounded-lg shadow-sm min-w-[180px] hover:shadow-md transition-shadow">
                    <p className="font-semibold text-sky-800">{member.username}</p>
                     <p className="font-semibold text-sky-800">{member.student_id}</p>
                    <div className="text-xs text-slate-600 mt-1">
                    </div>
                    {member.weeklyMark && (
                        <p className="mt-2 text-xs font-bold text-sky-600 bg-sky-100 px-2 py-1 rounded">Mark: {member.weeklyMark}/10</p>
                    )}
                </div>
            ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-4">
             <div className="flex gap-2">
                <a href={team.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"><GithubIcon /> GitHub</a>
                <a href={team.slidesLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"><SlidesIcon /> Slides</a>
            </div>
            <p className="text-xs text-slate-400">Last update: {team.lastUpdate}</p>
        </div>
    </div>
);

// --- UPDATED WeeklyMarkingForm Component ---
const WeeklyMarkingForm = ({ teams, onSaveMark }) => {
    const [formData, setFormData] = useState({});

    // Handles changes for both mark and comment inputs
    const handleInputChange = (teamId, memberUsername, field, value) => {
        const key = `${teamId}-${memberUsername}`;
        setFormData(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value,
            }
        }));
    };

    // Handles the submission for a single member
    const handleMemberSubmit = (teamId, member) => {
        const key = `${teamId}-${member.username}`;
        const memberData = formData[key];

        if (!memberData || memberData.mark === undefined || memberData.mark === '') {
            alert(`Please enter a mark for ${member.username}.`);
            return;
        }

        onSaveMark(teamId, member.username, memberData.mark, memberData.comment || '');
        alert(`Mark for ${member.username} has been submitted!`);
    };

    return (
        <div className="bg-white border border-sky-100 rounded-2xl shadow-lg p-6 sm:p-8">
            {teams.map(team => (
                <div key={team.team_id} className="mb-8 last:mb-0">
                    <h3 className="text-lg font-bold text-sky-600 border-b border-sky-200 pb-2 mb-4">{team.team_name}</h3>
                    <div className="space-y-6">
                        {team.members.map(member => {
                            const formKey = `${team.team_id}-${member.username}`;
                            return (
                                <div key={member.username} className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <p className="font-semibold text-sky-800 w-full md:w-1/4">{member.username}</p>
                                     <p className="font-semibold text-sky-800 w-full md:w-1/4">{member.student_id}</p>
                                    <div className="flex-grow flex flex-col sm:flex-row items-center gap-4">
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            placeholder="Mark (0-10)"
                                            value={formData[formKey]?.mark || ''}
                                            onChange={(e) => handleInputChange(team.team_id, member.username, 'mark', e.target.value)}
                                            className="w-full sm:w-32 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                                        />
                                        <textarea
                                            placeholder="Optional comments..."
                                            rows="1"
                                            value={formData[formKey]?.comment || ''}
                                            onChange={(e) => handleInputChange(team.team_id, member.username, 'comment', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleMemberSubmit(team.team_id, member)}
                                        className="px-4 py-2 font-semibold text-white bg-sky-500 rounded-lg shadow-sm hover:bg-sky-600 transition-colors w-full md:w-auto"
                                    >
                                        Submit
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};


// --- Main Supervisor Dashboard Component ---
export default function App() {
    const [teams, setTeams] = useState([]);
    const [activeTab, setActiveTab] = useState("teams");
    const location = useLocation();
    const { spldata } = location?.state || {};

    useEffect(() => {
        const getAllTeams = async () => {
            if (!spldata?.pbl_id) return; // Guard clause
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`http://localhost:4000/api/pbl/get_all_teams_of_supervisor/${spldata.pbl_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTeams(response.data.data.teams);
            } catch (error) {
                console.error("Failed to fetch teams:", error);
            }
        };
        getAllTeams();
    }, [spldata]);

    // Handler for saving a single member's mark
    const handleSaveSingleMark = (teamId, memberUsername, mark, comment) => {
        // Here you would typically send this data to your backend
        console.log({ teamId, memberUsername, mark, comment });

        // This updates the local state to reflect the change immediately
        setTeams(prevTeams =>
            prevTeams.map(team => {
                if (team.team_id === teamId) {
                    const updatedMembers = team.members.map(member => {
                        if (member.username === memberUsername) {
                            return { ...member, weeklyMark: mark };
                        }
                        return member;
                    });
                    return { ...team, members: updatedMembers };
                }
                return team;
            })
        );
    };

    const totalStudents = teams.reduce((acc, t) => acc + t.members.length, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white font-sans">
            <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
                                <SupervisorIcon />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Supervisor Dashboard</h1>
                                <p className="text-sm text-slate-500">SPL Automation System</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-sky-100 hover:shadow-xl hover:border-sky-300 transition-all duration-200">
                        <p className="text-sm font-semibold text-slate-500">Assigned Teams</p>
                        <p className="text-4xl font-extrabold text-sky-600 mt-1">{teams.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-sky-100 hover:shadow-xl hover:border-sky-300 transition-all duration-200">
                        <p className="text-sm font-semibold text-slate-500">Total Students</p>
                        <p className="text-4xl font-extrabold text-sky-600 mt-1">{totalStudents}</p>
                    </div>
                </div>
                <div className="flex gap-4 mb-8">
                    <button onClick={() => setActiveTab("teams")} className={`px-6 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'teams' ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-sky-100/50'}`}>
                        My Teams
                    </button>
                    <button onClick={() => setActiveTab("marking")} className={`px-6 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'marking' ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-sky-100/50'}`}>
                        Give Marks
                    </button>
                </div>
                <div>
                    {activeTab === "teams" ? (
                        <div className="space-y-6">
                            {teams.map((team) => <TeamCard key={team.team_id} team={team} />)}
                        </div>
                    ) : (
                        <WeeklyMarkingForm teams={teams} onSaveMark={handleSaveSingleMark} />
                    )}
                </div>
            </main>
        </div>
    );
}