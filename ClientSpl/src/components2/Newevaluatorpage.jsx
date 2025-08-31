import React, { useEffect, useMemo, useState } from "react";
import { userContext } from "../hooks/AutoAuth";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

// --- Reusable Modal Component ---
const Modal = ({ title, message, onConfirm, onCancel }) => {
    if (!message) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-center gap-4">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-6 py-2 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white transition"
                    >
                        {onCancel ? "Confirm" : "OK"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [teams, setTeams] = useState([]);
    const { User } = userContext();
    const location = useLocation();
    const { spldata, type } = location?.state || {};

    const rubric = [
        { id: 1, key: "tech", label: "Technical Implementation", weight: 40, hint: "Correctness, architecture, testing" },
        { id: 2, key: "innovation", label: "Innovation & Creativity", weight: 25, hint: "Originality, problem framing" },
        { id: 3, key: "presentation", label: "Presentation Quality", weight: 20, hint: "Clarity, structure, visuals, demo" },
        { id: 4, key: "docs", label: "Documentation", weight: 15, hint: "Readme, setup, code comments" },
    ];
    const navigateto =useNavigate()
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [selectedMemberUsername, setSelectedMemberUsername] = useState("");
    const [scores, setScores] = useState(() => rubric.reduce((acc, r) => ({ ...acc, [r.key]: 0 }), {}));
    const [comments, setComments] = useState("");
    const [modal, setModal] = useState({ title: "", message: "" });
    const [existingEvaluation, setExistingEvaluation] = useState(null); // State for existing marks

    
    useEffect(() => {
        const getAllTeamsInPbl = async () => {
            if (!spldata?.pbl_id) return;
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(
                    `http://localhost:4000/api/pbl/get_all_teams_in_pbl/${spldata.pbl_id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const teamsData = res.data.data.teams || [];
                setTeams(teamsData);
                // Set initial selection after fetching
                if (teamsData.length > 0) {
                    const firstTeam = teamsData[0];
                    setSelectedTeamId(firstTeam.team_id);
                    if (firstTeam.members && firstTeam.members.length > 0) {
                        setSelectedMemberUsername(firstTeam.members[0].username);
                    }
                }
            } catch (err) {
                console.error("Error fetching teams:", err);
                setModal({ title: "Error", message: "Could not fetch teams.", onConfirm: () => setModal({ message: "" }) });
            }
        };
        getAllTeamsInPbl();
    }, [spldata]);

 
    // useEffect(() => {
    //     const fetchExistingMarks = async () => {
    //         if (!selectedTeamId || !selectedMemberUsername || !User?.user?.username || !type) {
    //             return;
    //         }
    //         try {
    //             const token = localStorage.getItem('token');
            
    //             const params = {
    //                 pbl_id: spldata.pbl_id,
    //                 team_id: selectedTeamId,
    //                 student_username: selectedMemberUsername,
    //                 judge_username: User.user.username,
    //                 presentation_type: type,
    //             };
    //             console.log(params)
    //             console.log(type,spldata.pbl_id)
    //             const res = await axios.get(`http://localhost:4000/api/pbl/judge/${spldata_pbl_id}/marks/${type}`, {
    //                 headers: { Authorization: `Bearer ${token}` }
    //             });
    //             console.log(res.data.data)
    //             if (res.data.data) {
    //                 const existingData = res.data.data;
    //                 console.log(res.data.data)
    //                 setExistingEvaluation(existingData);
               
    //                 const newScores = {};
    //                 rubric.forEach(r => {
    //                     const foundMark = existingData.marks.find(m => m.pbl_criteria_id === r.id);
    //                     if (foundMark) {
    //                         newScores[r.key] = foundMark.mark;
    //                     }
    //                 });
    //                 setScores(newScores);
    //                 setComments(existingData.comments || "");
    //             } else {
             
    //                 resetForm();
    //             }
    //         } catch (error) {
               
    //             if (error.response && error.response.status !== 404) {
    //                 console.error("Error fetching existing marks:", error);
    //             }
    //             resetForm(); 
    //         }
    //     };

    //     fetchExistingMarks();
    // }, [selectedTeamId, selectedMemberUsername, User, type, spldata]);

    const selectedTeam = useMemo(() => teams.find((t) => t.team_id === selectedTeamId) ?? null, [teams, selectedTeamId]);

    const totalScore = useMemo(() => {
        let sum = 0;
        rubric.forEach((r) => {
            const score = Number(scores[r.key] || 0);
            sum += (Math.max(0, Math.min(10, score)) / 10) * r.weight;
        });
        return Math.round(sum * 10) / 10;
    }, [scores, rubric]);

    const handleScoreChange = (key, value) => {
        setScores((prev) => ({ ...prev, [key]: value }));
    };

    const resetForm = () => {
        setScores(rubric.reduce((acc, r) => ({ ...acc, [r.key]: 0 }), {}));
        setComments("");
        setExistingEvaluation(null);
    };

    const submitEvaluation = async () => {
        if (!selectedTeam || !selectedMemberUsername) {
            setModal({ title: "Selection Required", message: "Please select a team and a member.", onConfirm: () => setModal({ message: "" }) });
            return;
        }

        const evaluationPayload = {
            pbl_id: spldata.pbl_id,
            team_id: selectedTeam.team_id,
            student_username: selectedMemberUsername,
            judge_username: User.user.username,
            pbl_criteria_ids: rubric.map(r => r.id),
            marks: rubric.map(r => Number(scores[r.key] || 0)),
            comments: comments,
            presentation_type: type,
        };

        try {
            const token = localStorage.getItem('token');
            let response;
            if (existingEvaluation) {
               
                response = await axios.put(`http://localhost:4000/api/pbl/judge/marking/${existingEvaluation.evaluation_id}`, evaluationPayload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
          
                response = await axios.post('http://localhost:4000/api/pbl/judge/marking', evaluationPayload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            setModal({ title: "Success", message: `Evaluation has been ${existingEvaluation ? 'updated' : 'submitted'} successfully.`, onConfirm: () => setModal({ message: "" }) });
            resetForm();
        } catch (error) {
            console.error("Failed to submit evaluation:", error);
            setModal({ title: "Submission Failed", message: error.response?.data?.message || "An error occurred.", onConfirm: () => setModal({ message: "" }) });
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#E9F0FF] font-sans">
            <Modal {...modal} />
            <header className="bg-white border-b-2 border-gray-200 shadow-sm sticky top-0 z-10">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="flex justify-between items-center py-4">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center text-xl font-bold shadow-md">E</div>
                             <div>
                                 <h1 className="text-xl font-semibold text-gray-800">Evaluator Dashboard</h1>
                                 <p className="text-sm text-gray-500">SPL Automation System</p>
                             </div>
                         </div>
                     </div>
                 </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Selection & Info */}
                    <div className=" bg-white border border-gray-200 rounded-xl shadow-md">
                        <div className="flex flex-row justify-between p-6 border-b-2 border-gray-100">
                            <h2 className="text-lg  font-bold text-gray-800">Select Team & Member</h2>
                            <button onClick={()=>{navigateto('/updatemarks',{state:{spldata,type,selectedTeamId}})}} className="bg-[#4060C1] rounded-md text-md p-2 text-white">Update Marks</button>
                        </div>
                        <div className="p-6 grid gap-6">
                            <div>
                                <label className="text-sm font-semibold text-gray-600 mb-1 block">Team</label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                                    value={selectedTeamId ?? ""}
                                    onChange={(e) => {
                                        const id = Number(e.target.value);
                                        setSelectedTeamId(id);
                                        const team = teams.find((t) => t.team_id === id);
                                        setSelectedMemberUsername(team?.members[0]?.username ?? "");
                                    }}
                                >
                                    {teams.map((t) => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600 mb-1 block">Member</label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                                    value={selectedMemberUsername}
                                    onChange={(e) => setSelectedMemberUsername(e.target.value)}
                                >
                                    {selectedTeam?.members.map((m) => <option key={m.student_id} value={m.username}>{m.full_name} ({m.student_id})</option>)}
                                </select>
                            </div>
                            {selectedTeam && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 grid gap-3">
                                    <div className="flex justify-between items-center"><span className="text-sm text-gray-500">Supervisor:</span><span className="font-semibold text-gray-800">{selectedTeam.supervisor_name}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-sm text-gray-500">Team Info:</span><span className="font-semibold text-gray-800">{selectedTeam.team_info || 'N/A'}</span></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl shadow-md">
                        <div className="p-6 border-b-2 border-gray-100 flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Evaluation Rubric</h2>
                                {existingEvaluation ? (
                                    <p className="text-sm text-yellow-600 font-semibold">Editing previous submission</p>
                                ) : (
                                    <p className="text-sm text-gray-500">Score each criterion (0–10).</p>
                                )}
                            </div>
                            <button onClick={submitEvaluation} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition">
                                {existingEvaluation ? '✅ Update Evaluation' : '✅ Submit Evaluation'}
                            </button>
                        </div>

                        <div className="p-6 grid gap-6">
                            {rubric.map((r) => (
                                <div key={r.key} className="p-4 rounded-lg hover:bg-gray-50 transition">
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-800">{r.label}</h3>
                                            <p className="text-xs text-gray-500">Weight: {r.weight}% — {r.hint}</p>
                                        </div>
                                        <div className="w-full sm:w-56">
                                            <input type="range" min="0" max="10" step="1" value={scores[r.key]} onChange={(e) => handleScoreChange(r.key, Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500" />
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs text-gray-500">Score</span>
                                                <input type="number" min="0" max="10" value={scores[r.key]} onChange={(e) => { const v = Number(e.target.value); handleScoreChange(r.key, isNaN(v) ? 0 : Math.max(0, Math.min(10, v))); }} className="w-20 text-right text-sm p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 flex justify-between items-center">
                                <span className="font-bold text-sky-800">Total (weighted)</span>
                                <span className="font-bold text-xl text-sky-800">{totalScore} / 100</span>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-600 mb-1 block">Comments (optional)</label>
                                <textarea rows="4" placeholder="Write constructive feedback…" value={comments} onChange={(e) => setComments(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition" />
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <button onClick={resetForm} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">↺ Reset Form</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}