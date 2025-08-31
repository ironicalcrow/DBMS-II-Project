import React, { useState, useEffect } from "react";
import { userContext } from "../hooks/AutoAuth";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const DevFiestaLogo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
    </svg>
);

// New TeamCard component to display team information
const TeamCard = ({ team, onDetails,supervisor ,pbl}) => {
    console.log(team)
    const navigateto =useNavigate()
    
   return ( <div className="bg-white border border-slate-200/70 rounded-xl shadow-sm hover:shadow-lg hover:border-sky-300 transition-all duration-200 p-5 w-full">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-semibold uppercase text-sky-600 tracking-wider">PBL ID: {team.pbl_id}</p>
                <h3 className="text-lg font-bold text-slate-800 mt-1">{team.team_name}</h3>
                <p className="text-sm text-slate-500 mt-1">Supervisor Name: <b>{supervisor}</b></p>
            </div>
            <div className="text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
        </div>
        <button onClick={()=>{navigateto('/newprojectdashboard',{state:{team,pbl}})}} className="mt-4 w-full text-center py-2 text-sm font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors shadow-sm">
            View Team Details
        </button>
    </div>
)};

export default function App() {
    const { User } = userContext();
    const location = useLocation();
    const { studentId, pbl } = location?.state || {};
    const[supervisor,setsupervisor] = useState('')
    
    // State to hold the fetched team information
    const [teamInfo, setTeamInfo] = useState(null);

    useEffect(() => {
        const getStudentTeam = async () => {
            // Ensure we have the necessary data before fetching
            if (!User?.user?.username || !pbl?.pbl_id) {
                return;
            }

            const token = localStorage.getItem('token');
            const username = User.user.username;
            const pbl_id = pbl.pbl_id;

            try {
                const response = await axios.get(
                    'http://localhost:4000/api/pbl/get_team_information_by_username',
                    {
                        params: { username, pbl_id },
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                console.log(response.data.data.team_information)
               const supervisor_id = response.data.data.team_information[0].supervisor_id;
console.log(supervisor_id);

const response2 = await axios.get(
    `http://localhost:4000/api/pbl/supervisor/${supervisor_id}/username`,
    {
        headers: { Authorization: `Bearer ${token}` }
    }
);
    setsupervisor(response2.data.data.username)
console.log(response2.data.data.username); 

                
               
                if (response.data.data.team_information.length > 0) {
                    setTeamInfo(response.data.data.team_information[0]);
                }
            } catch (error) {
                console.error("Failed to fetch team information:", error);
            }
        };

        getStudentTeam();
    }, [User, pbl]); // Rerun effect if User or pbl data changes

    const handleDetails = (teamId) => {
        console.log(`Navigating to details for team ID: ${teamId}`);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-cyan-50 to-blue-100 font-sans p-4 sm:p-8">
            <div className="max-w-xl mx-auto">
                <header className="text-center mb-8">
                    <div className="w-16 h-16 bg-sky-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                        <DevFiestaLogo />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">Personal Dashboard</h1>
                </header>

                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200/50 mb-10 text-center">
                    <img
                        src={User?.user?.image}
                        alt="User Avatar"
                        className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-sky-400 object-cover shadow-md"
                        onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/120x120/e0f7fa/1c3d63?text=${User?.user?.username?.charAt(0) || 'U'}`}}
                    />
                    <h2 className="text-2xl font-bold text-slate-800">{User?.user?.username}</h2>
                    <p className="text-slate-500 font-medium">Student ID: {studentId}</p>

                    <div className="text-left mt-6">
                         <div className="bg-teal-50 text-teal-800 p-4 rounded-lg shadow-inner">
                             <p className="font-bold text-sm">Team Status</p>
                             <div className="bg-teal-200 rounded-full h-2.5 mt-2">
                                 <div
                                     className="bg-teal-600 h-2.5 rounded-full transition-all duration-500"
                                     style={{ width: teamInfo ? '100%' : '0%' }}
                                 ></div>
                             </div>
                              <p className="text-xs font-bold text-teal-700 mt-1">{teamInfo ? 'Team Assigned' : 'No Team Assigned'}</p>
                         </div>
                     </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-800 text-center mb-6">My Team</h3>
                <div className="space-y-6">
                    {teamInfo ? (
                        <TeamCard
                            team={teamInfo}
                            onDetails={() => handleDetails(teamInfo.team_id,)}
                            supervisor={supervisor}
                            pbl={pbl}
                        />
                    ) : (
                        <p className="text-center text-slate-500 mt-8">No team information found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}