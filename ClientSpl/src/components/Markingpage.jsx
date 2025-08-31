import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Crown, Medal, Award } from 'lucide-react';
import axios from 'axios';

// --- LeaderboardEntry Component ---
// A new component to display each team in the leaderboard.
const LeaderboardEntry = ({ team, rank }) => {
    const getRankStyle = (rank) => {
        switch (rank) {
            case 1:
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-400',
                    icon: <Crown size={24} className="text-yellow-500" />,
                    textColor: 'text-yellow-600'
                };
            case 2:
                return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-300',
                    icon: <Medal size={24} className="text-gray-500" />,
                    textColor: 'text-gray-600'
                };
            case 3:
                return {
                    bg: 'bg-orange-50',
                    border: 'border-orange-400',
                    icon: <Award size={24} className="text-orange-500" />,
                    textColor: 'text-orange-600'
                };
            default:
                return {
                    bg: 'bg-white',
                    border: 'border-transparent',
                    icon: <span className="text-gray-500 font-bold">{rank}</span>,
                    textColor: 'text-gray-500'
                };
        }
    };

    const rankStyle = getRankStyle(rank);

    return (
        <div 
            className={`flex items-center p-4 my-3 rounded-xl shadow-sm transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg border-l-4 ${rankStyle.bg} ${rankStyle.border}`}
            style={{ animation: `fadeInUp 0.5s ${rank * 0.08}s ease-out forwards`, opacity: 0 }}
        >
            <div className="flex items-center justify-center w-12 h-12 min-w-[48px] mr-4">
                {rankStyle.icon}
            </div>
            <div className="flex-grow">
                <h3 className="text-lg font-bold text-gray-800">{team.team_name}</h3>
                <p className="text-sm text-gray-600">{team.members}</p>
            </div>
            <div className="flex items-center text-right">
                <span className={`text-xl font-extrabold ${rankStyle.textColor}`}>{team.total_marks?team.total_marks:0}</span>
                <span className="text-sm font-medium text-gray-500 ml-1">pts</span>
            </div>
        </div>
    );
};

// --- Main Leaderboard Page Component ---
const LeaderboardPage = () => {
    const location = useLocation();
    const {id}=location?.state || ''
    const {hname}=location?.state || ''
    console.log(hname)
    console.log(id)
     const [teams, setTeams] = useState([]);
    useEffect(()=>{
        const getleaderboard = async()=>{
        const token = localStorage.getItem('token')
        const response = await axios.get(`http://localhost:4000/api/participation/leaderboard/${id}`,{
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(response.data.data.leaderboard[0])
        const allteams = response.data.data.leaderboard[0] || []
        setTeams(allteams)
        console.log(teams)
        }
        getleaderboard()
    },[])
    const hackathonName = hname || "Innovation Challenge 2025";
   

    return (
        <div className="min-h-screen font-sans bg-[#E9F0FF]">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <header className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Leaderboard</h1>
                    <p className="mt-2 text-xl text-indigo-600 font-semibold">{hackathonName}</p>
                </div>
            </header>
            <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                {teams.length > 0 ? (
                    <div>
                        {teams.map((team, index) => (
                            <LeaderboardEntry 
                                key={team.team_id} 
                                team={team}
                                rank={team.team_rank} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-gray-700">Leaderboard is being updated</h2>
                        <p className="mt-2 text-gray-500">Check back soon to see the final rankings.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LeaderboardPage;
