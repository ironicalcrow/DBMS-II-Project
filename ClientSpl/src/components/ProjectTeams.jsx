import React, {useEffect,useState} from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { userContext } from '../hooks/AutoAuth';
import { FaProjectDiagram, FaPenAlt } from 'react-icons/fa';
import { CgFileDocument } from "react-icons/cg";

// --- HELPER COMPONENT: SkeletonCard ---
// A placeholder that mimics the card layout while data is loading.
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex items-center space-x-2 mb-6">
            <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="border-t border-gray-200 pt-4 flex justify-end gap-3">
            <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-32 bg-gray-300 rounded-lg"></div>
        </div>
    </div>
);

// --- HELPER COMPONENT: MemberAvatar ---
// Displays user initials in a styled circular avatar.
const MemberAvatar = ({ username }) => {
    const getInitials = (name = '') => name.charAt(0).toUpperCase();
    return (
        <div className="flex items-center gap-2 bg-gray-100 rounded-full pr-3">
            <div className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center text-xs font-bold">
                {getInitials(username)}
            </div>
            <span className="text-sm font-medium text-gray-700">{username}</span>
        </div>
    );
};


// --- PRESENTATIONAL COMPONENT: TeamCard ---
// The redesigned card for displaying each team.
const TeamCard = ({ team, onAddMarksClick, logger, host, index }) => {
    const [teamMembers, setTeamMembers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getMembers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:4000/api/participation/members/${team.team_id}`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                setTeamMembers(response.data.data.members);
            } catch (error) { console.error("Failed to fetch team members:", error); }
        };
        getMembers();
    }, [team.team_id]);

    const handleViewProject = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/project/team/${team.team_id}`);
            const project = response.data.data.project[0];
            if (project) {
                navigate('/viewproject', { state: { project } });
            } else {
                alert("This team has not submitted a project yet.");
            }
        } catch (error) {
            console.error("Error fetching project:", error);
            alert("Could not fetch the project details.");
        }
    };

    return (
        <div
            className="bg-white rounded-2xl shadow-lg border border-transparent transition-all duration-300 ease-in-out hover:shadow-indigo-100/50 hover:border-indigo-300 hover:-translate-y-1.5 animate-fadeInUp"
            style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
        >
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 truncate">{team.team_name}</h2>
                <p className="text-sm text-gray-500">Project Submission</p>
            </div>

            <div className="p-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Team Members</h3>
                <div className="flex flex-wrap gap-2">
                    {teamMembers.length > 0 ? (
                        teamMembers.map((member) => (
                            <MemberAvatar key={member.user_id} username={member.username} />
                        ))
                    ) : (
                        <span className="text-sm text-gray-500">Loading...</span>
                    )}
                </div>
            </div>

            <div className="p-4 bg-gray-50/70 rounded-b-2xl flex items-center justify-end gap-3">
                <button
                    onClick={handleViewProject}
                    className="font-semibold text-white bg-[#4060C1] border border-gray-300 hover:bg-gray-100 transition-all duration-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                    <FaProjectDiagram /> View Project
                </button>
                {logger?.user?.username !== host && (
                    <button
                        onClick={() => onAddMarksClick(team)}
                        className="font-semibold text-white bg-[#4060C1] hover:bg-blue-700 transition-all duration-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                        <FaPenAlt /> Evaluate
                    </button>
                )}
            </div>
        </div>
    );
};

// --- MODAL COMPONENT: AddMarksModal ---
// Functionality is identical, styling is tweaked for consistency.
const AddMarksModal = ({ isOpen, onClose, team, hackathon_id, info, User }) => {
    const criteria = info || [];
    const [mark, setMarks] = useState({});
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const initialMarks = criteria.reduce((acc, crit) => ({ ...acc, [crit.criteria_id]: '' }), {});
            setMarks(initialMarks);
            setComments('');
        }
    }, [isOpen, team, criteria]);

    const handleMarkChange = (criterionId, value) => {
        const max = 10;
        const numValue = value === '' ? '' : Math.max(0, Math.min(max, Number(value)));
        setMarks(prev => ({ ...prev, [criterionId]: numValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const criteria_ids = criteria.map(criterion => criterion.criteria_id);
        const marksArray = criteria.map(criterion => mark[criterion.criteria_id] || 0);
        const judge_username = User.username;
        const payload = { team_id: team?.team_id, judge_username, hackathon_id, criteria_ids, marks: marksArray, comments };

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post("http://localhost:4000/api/participation/mark", payload, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            });
            console.log("Marks submitted successfully:", response.data);
            alert(`Marks for ${team?.team_name} submitted successfully!`);
            onClose();
        } catch (error) {
            console.error("Error submitting marks:", error.response?.data || error.message);
            alert("Failed to submit marks.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-transform duration-300 animate-zoomIn">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Evaluate: <span className="text-indigo-600">{team?.team_name}</span></h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl transition-colors">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-8 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-6">
                            {criteria.map((criterion) => (
                                <div key={criterion.criteria_id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <div className="md:col-span-2">
                                        <label htmlFor={criterion.criteria_id} className="font-semibold text-gray-700">{criterion.criteriainfo}</label>
                                        <p className="text-sm text-gray-500">{criterion.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="number" id={criterion.criteria_id} value={mark[criterion.criteria_id] || ''} onChange={(e) => handleMarkChange(criterion.criteria_id, e.target.value)} placeholder="0" min="0" max="10" required className="w-full text-center font-semibold text-lg p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"/>
                                        <span className="font-medium text-gray-500">/ 10</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <label htmlFor="comments" className="font-semibold text-gray-700">Overall Comments</label>
                            <p className="text-sm text-gray-500 mb-2">Provide any additional feedback for the team.</p>
                            <textarea id="comments" value={comments} onChange={(e) => setComments(e.target.value)} rows="4" className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="e.g., Excellent presentation, but the UI could be more polished..."></textarea>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end items-center gap-4">
                        <button type="button" onClick={onClose} className="font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 px-5 py-2.5 rounded-lg transition">Cancel</button>
                        <button type="submit" disabled={submitting} className="font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg transition disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]">
                            {submitting ? 'Submitting...' : 'Submit Marks'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
export default function App() {
    const { User } = userContext();
    const location = useLocation();
    const { hid } = location.state || {};
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);

    const handleOpenModal = (team) => {
        const currentDate = new Date();
        const hackathonEndDate = new Date(hid?.ending_date);
        hackathonEndDate.setDate(hackathonEndDate.getDate() + 1);

        if (currentDate > hackathonEndDate) {
            alert('The hackathon has ended, you cannot add marks.');
            return;
        }
        setSelectedTeam(team);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTeam(null);
    };

    useEffect(() => {
        const getTeams = async () => {
            if (!hid?.hackathon_id) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:4000/api/participation/hackathon/${hid.hackathon_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
              
                setTimeout(() => {
                    setTeams(response.data.data.teams[0] || []);
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error("Failed to fetch teams:", error);
                setLoading(false);
            }
        };
        getTeams();
    }, [hid]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .font-sans { font-family: 'Inter', sans-serif; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes zoomIn { from { transform: scale(0.95); } to { transform: scale(1); } }
                .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
                .animate-zoomIn { animation: zoomIn 0.3s ease-out forwards; }
            `}</style>
            <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 bg-[#E9F0FF] font-sans">
                <div className="w-full max-w-7xl mx-auto">
                    <header className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{hid?.hackathon_name}</h1>
                        <p className="text-lg text-gray-600 mt-2">Judging Panel & Project Showcase</p>
                    </header>

                    <main>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : teams.length > 0 ? (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800">Showing {teams.length} Team{teams.length > 1 ? 's' : ''}</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {teams.map((team, index) => (
                                        <TeamCard
                                            key={team.team_id}
                                            team={team}
                                            logger={User}
                                            host={hid.host_username}
                                            onAddMarksClick={handleOpenModal}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 px-6 bg-white rounded-2xl shadow-sm border">
                                <CgFileDocument className="mx-auto h-16 w-16 text-gray-400" />
                                <h3 className="mt-4 text-2xl font-bold text-gray-800">No Submissions Yet</h3>
                                <p className="text-gray-500 mt-2">Check back later to review team projects as they are submitted.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <AddMarksModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                team={selectedTeam}
                hackathon_id={hid?.hackathon_id}
                info={hid?.judging_criteria}
                User={User.user}
            />
        </>
    );
}