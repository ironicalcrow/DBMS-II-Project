import axios from "axios";
import { div } from "framer-motion/client";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StudentAdminDash from '../components/StudentAdminDash'

// --- SVG Icon Components (unchanged) ---
const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const ViewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

// --- CreateTeamModal Component (unchanged) ---
const CreateTeamModal = ({ isOpen, onClose, supervisors, students, onCreateTeam, pbl }) => {
    const [teamName, setTeamName] = useState("");
    const [selectedSupervisor, setSelectedSupervisor] = useState("");
    const [selectedStudents, setSelectedStudents] = useState([]);

    const handleStudentSelect = (username) => {
        setSelectedStudents((prevSelected) =>
            prevSelected.includes(username)
                ? prevSelected.filter((u) => u !== username)
                : [...prevSelected, username]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!teamName || !selectedSupervisor || selectedStudents.length === 0) {
            alert("Please fill all fields and select at least one student.");
            return;
        }
        const studentUsernamesAsObjects = selectedStudents.map(name => ({ username: name }));
        const newTeam = {
            pbl_id: pbl.pbl_id,
            team_name: teamName,
            team_info: '',
            usernames: studentUsernamesAsObjects,
            supervisor_username: selectedSupervisor,
        };
        onCreateTeam({
            id: Date.now(),
            name: newTeam.team_name,
            project: "Not Assigned",
            members: selectedStudents,
            supervisor: newTeam.supervisor_username,
            evaluators: ["Not Assigned"],
        });
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:4000/api/pbl/team-creation', newTeam, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error("Error creating team:", error.response?.data || error.message);
        }
        resetForm();
    };

    const resetForm = () => {
        setTeamName("");
        setSelectedSupervisor("");
        setSelectedStudents([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl m-4 transform transition-all">
                <div className="flex justify-between items-center p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Create New Team</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 rounded-full hover:bg-slate-100"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        {/* Form content remains the same */}
                         <div>
                            <label htmlFor="teamName" className="text-sm font-semibold text-slate-600 mb-2 block">Team Name</label>
                            <input type="text" id="teamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g., The Innovators" />
                        </div>
                        <div>
                            <label htmlFor="supervisor" className="text-sm font-semibold text-slate-600 mb-2 block">Select Supervisor</label>
                            <select id="supervisor" value={selectedSupervisor} onChange={(e) => setSelectedSupervisor(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                                <option value="" disabled>-- Choose a supervisor --</option>
                                {supervisors.map(s => <option key={s.supervisor_id} value={s.username}>{s.username}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-600 mb-2 block">Select Students</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-slate-300 rounded-lg p-3">
                                {students.map(student => (
                                    <label key={student.student_id} className="flex items-center gap-2 p-2 rounded-md hover:bg-sky-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(student.student_username)}
                                            onChange={() => handleStudentSelect(student.student_username)}
                                            className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700">{student.student_id}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-4 p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100">Cancel</button>
                        <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors shadow-sm"><PlusIcon /> Create Team</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- NEW ChangeDateModal Component ---
const ChangeDateModal = ({ isOpen, onClose, currentDates, onSave }) => {
    const [dates, setDates] = useState({
        proposal_Date: '',
        progress_date: '',
        final_presentation: ''
    });

    useEffect(() => {
        if (currentDates) {
            // Helper to format ISO string to YYYY-MM-DD for date input value
            const formatDate = (isoString) => isoString ? new Date(isoString).toISOString().split('T')[0] : '';
            
            setDates({
                proposal_Date: formatDate(currentDates.proposal_Date),
                progress_date: formatDate(currentDates.progress_date),
                final_presentation: formatDate(currentDates.final_presentation),
            });
        }
    }, [isOpen, currentDates]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setDates(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(dates)
        onSave(dates);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0  backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg m-4 transform transition-all">
                <div className="flex justify-between items-center p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Change SPL Dates</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 rounded-full hover:bg-slate-100"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <div>
                            <label htmlFor="proposal_Date" className="text-sm font-semibold text-slate-600 mb-2 block">Proposal Date</label>
                            <input type="date" name="proposal_Date" value={dates.proposal_Date} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                        </div>
                         <div>
                            <label htmlFor="progress_date" className="text-sm font-semibold text-slate-600 mb-2 block">Progress Date</label>
                            <input type="date" name="progress_date" value={dates.progress_date} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                        </div>
                        <div>
                            <label htmlFor="final_presentation" className="text-sm font-semibold text-slate-600 mb-2 block">Final Presentation Date</label>
                            <input type="date" name="final_presentation" value={dates.final_presentation} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-4 p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors shadow-sm">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};




export default function App() {
    const [students, setstudents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [numstudents, setnumstudents] = useState(0);
    const [numsupervisors, setnumsupervisors] = useState(0);
    const [supervisors, setsupervisors] = useState([]);
    const [judges, setjudges] = useState([]);
    const [numjudges, setnumjudges] = useState(0);
    const navigateto=useNavigate()
    const token = localStorage.getItem('token');
    const [studentdash,setstudentdash]=useState([])

    const location = useLocation();
    const { spldata } = location?.state || { pbl_id: null };
    const getallstudenttotalmarks=async ()=>{
        const response =  await axios.get(`http://localhost:4000/api/pbl/${spldata.pbl_id}/total-marks`, { headers: { Authorization: `Bearer ${token}` } })
        console.log(response.data.data)
        setstudentdash(response.data.data.results)

    }

    useEffect(() => {
        if (!spldata?.pbl_id) return;
        
        const fetchAllData = async () => {
            try {
                const [studentsRes, supervisorsRes, judgesRes, teamsRes] = await Promise.all([
                    axios.get(`http://localhost:4000/api/pbl/${spldata.pbl_id}/students`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`http://localhost:4000/api/pbl/${spldata.pbl_id}/supervisors`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`http://localhost:4000/api/pbl/${spldata.pbl_id}/judges`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`http://localhost:4000/api/pbl/get_all_teams_in_pbl/${spldata.pbl_id}`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setstudents(studentsRes.data.data.students);
                setnumstudents(studentsRes.data.data.students.length);
                setsupervisors(supervisorsRes.data.data.supervisors);
                setnumsupervisors(supervisorsRes.data.data.supervisors.length);
                setjudges(judgesRes.data.data.judges);
                setnumjudges(judgesRes.data.data.judges.length);
                setTeams(teamsRes.data.data.teams);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            }
        };
        fetchAllData();
    }, [spldata]);

    const [activeTab, setActiveTab] = useState("teams");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);

    const [evaluationCriteria] = useState([
        { name: "Technical Implementation", weight: 40 },
        { name: "Innovation & Creativity", weight: 25 },
        { name: "Presentation Quality", weight: 20 },
        { name: "Documentation", weight: 15 },
    ]);

    const statCards = [
        { label: "Total Teams", value: teams.length, color: "text-sky-600", emoji: "👥" },
        { label: "Supervisors", value: numsupervisors, color: "text-green-600", emoji: "🧑‍🏫" },
        { label: "Evaluators", value: numjudges, color: "text-purple-600", emoji: "📋" },
        { label: "Students", value: numstudents, color: "text-orange-600", emoji: "🎓" },
    ];

    const handleCreateTeam = (newTeam) => {
        const teamForUI = {
            team_id: newTeam.id,
            team_name: newTeam.name,
            members: newTeam.members.map(username => ({ username, full_name: username, student_id: username })),
            supervisor_name: newTeam.supervisor,
            team_info: 'Newly Created'
        };
        setTeams((prevTeams) => [...prevTeams, teamForUI]);
        setIsModalOpen(false);
    };

    const handleUpdateDates = async (newDates) => {
        console.log("Updating dates with:", newDates);
        try {
            const token = localStorage.getItem('token');
            
            await axios.put(`http://localhost:4000/api/pbl/${spldata.pbl_id}/update-dates`, newDates, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Dates updated successfully! Please refresh the page to see the changes everywhere.");
        } catch (error) {
            console.error("Failed to update dates:", error);
            alert(`Error: ${error.response?.data?.message || 'Failed to update dates.'}`);
        }
        setIsDateModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white font-sans">
            <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="flex justify-between items-center h-20">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
                                 <AdminIcon />
                             </div>
                             <div>
                                 <h1 className="text-xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
                                 <p className="text-sm text-slate-500">SPL Automation System</p>
                             </div>
                         </div>
                     </div>
                 </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                     {statCards.map((card, i) => (
                         <article key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60 hover:shadow-lg hover:border-slate-300 transition-all duration-200">
                             <div className="flex justify-between items-center">
                                 <div>
                                     <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                                     <p className={`text-3xl font-extrabold ${card.color}`}>{card.value}</p>
                                 </div>
                                 <div className="text-3xl">{card.emoji}</div>
                             </div>
                         </article>
                     ))}
                </section>

                <section className="mb-8">
                    <div className="bg-white border border-slate-200/80 rounded-xl p-1.5 flex gap-1.5">
                        <button onClick={() => setActiveTab("teams")} className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-colors duration-200 ${activeTab === 'teams' ? 'bg-sky-500 text-white shadow' : 'text-slate-600 hover:bg-sky-100/50'}`}>Teams Management</button>
                        <button onClick={() => setActiveTab("evaluations")} className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-colors duration-200 ${activeTab === 'evaluations' ? 'bg-sky-500 text-white shadow' : 'text-slate-600 hover:bg-sky-100/50'}`}>Individual Marking</button>
                        <button onClick={() => setActiveTab("reports")} className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-colors duration-200 ${activeTab === 'reports' ? 'bg-sky-500 text-white shadow' : 'text-slate-600 hover:bg-sky-100/50'}`}>Reports & Export</button>
                    </div>
                </section>

                <div>
                    {activeTab === "teams" && (
                        <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm">
                            <div className="p-6 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Teams Management</h2>
                                    <p className="text-sm text-slate-500 mt-1">Create and manage student teams</p>
                                </div>
                                <div className="flex gap-2">
                                     <button onClick={() => setIsDateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Change Dates</button>
                                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors shadow-sm"><PlusIcon /> Create Team</button>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                {teams.length > 0 ? teams.map((team) => (
                                    <div key={team.team_id} className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200">
                                        <div className="flex flex-col md:flex-row justify-between items-start">
                                            <div className="flex-1 mb-4 md:mb-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-base font-bold text-slate-800">{team.team_name}</h3>
                                                    <span className="text-xs font-semibold px-2.5 py-0.5 bg-sky-100 text-sky-700 rounded-full">{team.members.length} members</span>
                                                </div>
                                                <p className="text-sm text-slate-500 font-medium">Info: {team.team_info || "Not provided"}</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
                                                    <div>
                                                        <p className="font-semibold text-slate-600 mb-1">Members:</p>
                                                        <ul className="list-disc list-inside font-semibold space-y-1">
                                                            {team.members.map((member) => (
                                                                <li key={member.student_id}>{member.full_name} ({member.student_id})</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-600 mb-1">Supervisor:</p>
                                                        <p className="text-slate-500">{team.supervisor_name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={()=>{navigateto('/links',{state:{team,spldata}})}}   className="p-2 text-slate-500 rounded-md hover:bg-slate-100 hover:text-sky-600 transition" title="View"><ViewIcon /></button>
                                                <button className="p-2 text-slate-500 rounded-md hover:bg-slate-100 hover:text-green-600 transition" title="Edit"><EditIcon /></button>
                                                <button className="p-2 text-slate-500 rounded-md hover:bg-slate-100 hover:text-red-600 transition" title="Delete"><DeleteIcon /></button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10">
                                        <p className="text-slate-500">No teams created yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab==='evaluations' && (
                        <div className=" w-full h-screen  ">
                        <button onClick={getallstudenttotalmarks} className="p-4 bg-black  text-white rounded-md">Get All Markings</button>
                        <div className="grid grid-cols-3 grid-row-1">
                            {studentdash.map((student,key)=>{
                                return(
                                    <StudentAdminDash student={student}/>

                                )
                            })}
                        </div>
                    </div>)}
                </div>
            </main>

            <CreateTeamModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                supervisors={supervisors}
                students={students}
                onCreateTeam={handleCreateTeam}
                pbl={spldata}
            />
            <ChangeDateModal 
                isOpen={isDateModalOpen}
                onClose={() => setIsDateModalOpen(false)}
                currentDates={spldata}
                onSave={handleUpdateDates}
            />
        </div>
    );
}