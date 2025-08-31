import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Twitter, Facebook, Linkedin, Globe, Users, Award, ArrowRight, Search, List, Grid } from 'lucide-react';
import { useHackathons } from '../hooks/HackathonContext';
import axios from 'axios';

// --- Helper Functions (No logic changes) ---

const getHackathonStatus = (startDateStr, endDateStr) => {
    const now = new Date();
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (now > end) {
        return { text: 'Ended' };
    } else if (now >= start && now <= end) {
        return { text: 'Running' };
    } else {
        const daysLeft = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
        return { text: 'Upcoming', timeLeft: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} to start` };
    }
};

const getStatusClasses = (statusText) => {
    switch (statusText) {
        case 'Running':
            return 'bg-green-100 text-green-800 border-green-300';
        case 'Ended':
            return 'bg-red-100 text-red-800 border-red-300';
        case 'Upcoming':
            return 'bg-blue-100 text-blue-800 border-blue-300';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-300';
    }
};

// --- Redesigned Hackathon Card Component ---

const HackathonCard = ({ info }) => {
    const navigate = useNavigate();
    const status = getHackathonStatus(info.starting_date, info.ending_date);
    const statusClasses = getStatusClasses(status.text);

    const handleCardClick = async () => {
        console.log("Navigating to hackathon:", info.hackathon_name);
        const hackathon = info;
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://localhost:4000/api/hackathon/role/${hackathon.hackathon_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const User = response.data.data.role[0]?.role || 'No Role';
            navigate('/viewhackathon', { state: { hackathon, User } });
        } catch (error) {
            console.error("Error fetching role, navigating as guest:", error.response ? error.response.data : error.message);
            // Navigate even if role check fails, as a guest/non-participant
            navigate('/viewhackathon', { state: { hackathon, User: 'No Role' } });
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden flex flex-col"
        >
            <div className="relative">
                <img
                    src={info.hackathon_image || `https://placehold.co/600x400/E0E0E0/000000?text=Event`}
                    alt={`${info.hackathon_name} banner`}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full ${statusClasses} border`}>
                    {status.text}
                </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{info.hackathon_name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Globe size={16} className="mr-2" />
                    <span>{info.genre}</span>
                </div>
                <div className="text-sm text-gray-600 mb-6">
                    <p><strong>Starts:</strong> {new Date(info.starting_date).toLocaleDateString()}</p>
                    {status.text === 'Upcoming' && <p className="text-blue-600 font-semibold">{status.timeLeft}</p>}
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                     <div className="flex items-center">
                        <Users size={18} className="text-gray-400" />
                      
                    </div>
                    <div className="flex items-center text-blue-600 font-semibold">
                        <span>View Details</span>
                        <ArrowRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Redesigned Landing Page Component ---

export default function LandingPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { loading, hackathons } = useHackathons();
    const [filteredHackathons, setFilteredHackathons] = useState([]);

    useEffect(() => {
        if (!loading) {
            if (search.trim() !== '') {
                const filtered = hackathons.filter((h) => h.hackathon_name.toLowerCase().includes(search.toLowerCase()));
                setFilteredHackathons(filtered);
            } else {
                setFilteredHackathons(hackathons);
            }
        }
    }, [search, loading, hackathons]);

    if (loading) {
        return <div className='w-full min-h-screen bg-gray-50 flex items-center justify-center text-xl font-semibold'>Loading Hackathons...</div>
    }

    return (
        <div className='w-full min-h-screen bg-[#E9F0FF] font-sans'>
            {/* --- Hero Section --- */}
            <div className='relative w-full h-[60vh] min-h-[500px] flex items-center justify-center text-center text-white px-4'>
                <img className='absolute inset-0 w-full h-full object-cover' src={'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop'} alt="Futuristic background" />
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">Discover Your Next Challenge</h1>
                    <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-200">The ultimate platform for developers, innovators, and creators to compete, learn, and build the future.</p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 font-bold">
                        <button onClick={() => navigate('/hostingpage')} className="group flex items-center gap-3 bg-[#4060C1] hover:bg-blue-700 transition-colors px-8 py-4 text-lg rounded-lg shadow-lg transform hover:scale-105">
                            For Organizers <ArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
                        </button>
                        <button onClick={() => navigate('/hackathons')} className="group flex items-center gap-3 bg-gray-700/50 backdrop-blur-sm border border-white/20 hover:bg-gray-600/60 transition-colors px-8 py-4 text-lg rounded-lg shadow-lg transform hover:scale-105">
                            For Participants <ArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
                        </button>
                    </div>
                </div>
            </div>

          
            <div className='bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
                <div className="max-w-7xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                        <input
                            type="search"
                            placeholder="Search by hackathon name, theme, or technology..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 text-lg bg-white rounded-xl shadow-md border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                </div>
            </div>

            {/* --- Hackathons Grid Section --- */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">Featured Hackathons</h2>
                
                {filteredHackathons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {filteredHackathons.map((info) => (
                            <HackathonCard key={info.hackathon_id} info={info} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-xl text-gray-500">No hackathons found matching your search.</p>
                    </div>
                )}
            </div>

            {/* --- Footer Section --- */}
            <footer className="bg-gray-800 text-gray-300">
                <div className="max-w-7xl mx-auto py-16 px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-white text-lg mb-4">Devfiesta</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg mb-4">Hackathons</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="hover:text-white transition-colors">Browse</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Host a Hackathon</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg mb-4">Resources</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Your Projects</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Settings</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg mb-4">Connect</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-white transition-colors"><Twitter /></a>
                            <a href="#" className="hover:text-white transition-colors"><Facebook /></a>
                            <a href="#" className="hover:text-white transition-colors"><Linkedin /></a>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900 py-4 px-8 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Devfiesta. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
