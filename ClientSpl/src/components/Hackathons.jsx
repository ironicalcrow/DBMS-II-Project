import React, { useEffect, useState } from 'react';
import { Globe, Users, Award, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Assuming your context hook is in this path as per your original code
import { useHackathons } from '../hooks/HackathonContext'; 
import axios from 'axios';

// --- Helper Components & Icons (Original Logic) ---

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

const FilterCheckbox = ({ label, value, onChange, checked }) => (
    <label className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 cursor-pointer transition-colors">
        <input
            type="checkbox"
            value={value}
            onChange={onChange}
            checked={checked}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition"
        />
        <span className="text-base font-medium">{label}</span>
    </label>
);

const FilterGroup = ({ title, children }) => (
    <div className="py-6 border-b border-gray-200 last:border-b-0">
        <h3 className="font-semibold text-lg text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

// --- Status Logic (Original) ---

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
        return { text: 'Upcoming', timeLeft: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` };
    }
};

const getStatusClasses = (statusText) => {
    switch (statusText) {
        case 'Running':
            return 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-600/20';
        case 'Ended':
            return 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-600/20';
        case 'Upcoming':
            return 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-600/20';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

// --- REDESIGNED HackathonCard Component (Original Logic) ---

const HackathonCard = ({ info, style }) => {
    const navigateto = useNavigate();
    const status = getHackathonStatus(info.starting_date, info.ending_date);
    const statusClasses = getStatusClasses(status.text);

    // UNCHANGED: Original navigation logic
    const handleCardClick = async () => {
        console.log("Navigating to hackathon:", info.hackathon_name);
        const hackathon = info
        const token =localStorage.getItem('token')
        await axios.get(`http://localhost:4000/api/hackathon/role/${hackathon.hackathon_id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(response => {
            const User = response.data.data.role[0].role ;
            console.log(User)
            navigateto('/viewhackathon', { state: { hackathon,User} })
        })
        .catch(error => {
            console.error("Error:", error.response ? error.response.data : error.message);
        });
    };

    return (
        <div
            onClick={handleCardClick}
            style={style}
            className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-500 card-enter"
        >
            <div className="relative">
                <img
                    src={info.hackathon_image || `https://placehold.co/600x250/6D8EF2/FFFFFF?text=${encodeURIComponent(info.hackathon_name)}`}
                    alt={`${info.hackathon_name} banner`}
                    className="w-full h-40 object-cover"
                />
                <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full ${statusClasses}`}>
                    {status.text}
                </span>
            </div>
            
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 truncate mb-3 group-hover:text-blue-600 transition-colors">
                    {info.hackathon_name}
                </h3>
                
                <div className="flex items-center text-gray-600 text-sm space-x-5 mb-4">
                    <span className="flex items-center"><Globe size={14} className="mr-1.5" /> {info.genre}</span>
                    <span className="flex items-center"><Users size={14} className="mr-1.5" /> 100+ Participants</span>
                </div>
                
                <p className="text-sm font-medium text-gray-500">
                    {status.text === 'Upcoming' 
                        ? status.timeLeft
                        : `${info.starting_date.split('T')[0]} - ${info.ending_date.split('T')[0]}`
                    }
                </p>
            </div>
        </div>
    );
};


// --- Main Page Component ---

const HackathonSearchPage = () => {
    // UNCHANGED: All state and logic hooks
    const { hackathons, Loading } = useHackathons(); 
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedDurations, setSelectedDurations] = useState([]);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [activeSort, setActiveSort] = useState('');
    const [filteredHackathons, setFilteredHackathons] = useState([]);
    const [showFilters, setShowFilters] = useState(false);


    useEffect(() => {
        let tempHackathons = hackathons || [];
        if (searchTerm.trim() !== '') {
            tempHackathons = tempHackathons.filter(h => h.hackathon_name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (selectedGenre) {
            tempHackathons = tempHackathons.filter(h => h.genre === selectedGenre);
        }
        if (selectedDurations.length > 0) {
            tempHackathons = tempHackathons.filter(h => selectedDurations.includes(h.duration));
        }
        if (selectedStatuses.length > 0) {
            tempHackathons = tempHackathons.filter(h => {
                const status = getHackathonStatus(h.starting_date, h.ending_date);
                return selectedStatuses.includes(status.text);
            });
        }
        const sortedHackathons = [...tempHackathons];
        if (activeSort === 'submission') {
            sortedHackathons.sort((a, b) => new Date(a.ending_date) - new Date(b.ending_date));
        } else if (activeSort === 'recent') {
            sortedHackathons.sort((a, b) => new Date(b.added_date) - new Date(a.added_date));
        }
        setFilteredHackathons(sortedHackathons);
    }, [searchTerm, selectedGenre, selectedDurations, selectedStatuses, activeSort, hackathons]);
    
    // UNCHANGED: Handlers
    const handleDurationChange = (event) => {
        const { value, checked } = event.target;
        setSelectedDurations(prev => checked ? [...prev, value] : prev.filter(d => d !== value));
    };
    const handleStatusChange = (event) => {
        const { value, checked } = event.target;
        setSelectedStatuses(prev => checked ? [...prev, value] : prev.filter(s => s !== value));
    };
    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedGenre('');
        setSelectedDurations([]);
        setSelectedStatuses([]);
        setActiveSort('');
    };

    if (Loading) {
        return <div className="text-center p-10 font-bold text-xl bg-[#E9F0FF] min-h-screen">Loading Hackathons...</div>;
    }

    return (
        <div className="bg-[#E9F0FF] min-h-screen font-sans">
            <style>{`
                @keyframes fadeInUp { 
                    from { opacity: 0; transform: translateY(20px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .card-enter { 
                    animation: fadeInUp 0.5s ease-out forwards; 
                }
                input[type="search"]:focus {
                    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.5);
                }
            `}</style>
            
            <header className="bg-gradient-to-br from-[#4060C1] to-[#6D8EF2] text-white py-20 sm:py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">Find Your Next Challenge</h1>
                    <p className="mt-4 text-lg text-indigo-200 max-w-2xl mx-auto">Explore hackathons, showcase your skills, and bring your ideas to life.</p>
                </div>
            </header>

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="relative flex items-center mb-10">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input
                        type="search"
                        placeholder="Search by hackathon title or keyword..."
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* --- Filters Sidebar --- */}
                    <aside className={`lg:col-span-3 lg:block ${showFilters ? 'block' : 'hidden'} mb-8 lg:mb-0`}>
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                                <button onClick={clearAllFilters} className="text-sm font-semibold text-blue-600 hover:underline">Clear All</button>
                            </div>
                            
                            <FilterGroup title="Status">
                                <FilterCheckbox label="Upcoming" value="Upcoming" onChange={handleStatusChange} checked={selectedStatuses.includes('Upcoming')} />
                                <FilterCheckbox label="Running" value="Running" onChange={handleStatusChange} checked={selectedStatuses.includes('Running')} />
                                <FilterCheckbox label="Ended" value="Ended" onChange={handleStatusChange} checked={selectedStatuses.includes('Ended')} />
                            </FilterGroup>

                            <FilterGroup title="Duration">
                                <FilterCheckbox label="12hr" value="12" onChange={handleDurationChange} checked={selectedDurations.includes('12')} />
                                <FilterCheckbox label="24hr" value="24" onChange={handleDurationChange} checked={selectedDurations.includes('24')} />
                                <FilterCheckbox label="48hr" value="48" onChange={handleDurationChange} checked={selectedDurations.includes('48')} />
                            </FilterGroup>

                            <FilterGroup title="Genre">
                                <select className="w-full p-3 border border-gray-300 rounded-lg text-base bg-gray-50" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
                                    <option value="">All Genres</option>
                                    <option value="Web Development">Web Development</option>
                                    <option value="App Development">App Development</option>
                                    <option value="AI">AI</option>
                                    <option value="Blockchain">Blockchain</option>
                                    <option value="Cybersecurity">Cybersecurity</option>
                                    <option value="Cloud / DevOps">Cloud / DevOps</option>
                                    <option value="AR/VR / XR">AR/VR / XR</option>
                                    <option value="Game Development">Game Development</option>
                                    <option value="Data Science">Data Science</option>
                                    <option value="University">University</option>
                                </select>
                            </FilterGroup>

                             <FilterGroup title="Host">
                                 <select className="w-full p-3 border border-gray-300 rounded-lg text-base">
                                     <option>Select host</option>
                                     <option>Google</option>
                                     <option>Adobe</option>
                                     <option>Microsoft</option>
                                 </select>
                             </FilterGroup>
                        </div>
                    </aside>

                    {/* --- Main Content: Hackathon List --- */}
                    <main className="lg:col-span-9">
                        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-8">
                            <p className="text-base text-gray-700 font-medium mb-4 sm:mb-0">Showing {filteredHackathons.length} hackathons</p>
                            <div className="flex items-center gap-2 text-base">
                                <span className="font-semibold text-gray-800">Sort:</span>
                                <button onClick={() => setActiveSort('submission')} className={`px-4 py-1.5 rounded-full font-medium transition-all duration-200 ${activeSort === 'submission' ? 'text-white bg-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>
                                    Submission date
                                </button>
                                <button onClick={() => setActiveSort('recent')} className={`px-4 py-1.5 rounded-full font-medium transition-all duration-200 ${activeSort === 'recent' ? 'text-white bg-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>
                                    Recently added
                                </button>
                            </div>
                        </div>

                        <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden w-full mb-6 bg-white text-gray-800 font-semibold py-3 px-4 rounded-lg text-lg shadow-sm border border-gray-200">
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {filteredHackathons.length > 0 ? (
                                filteredHackathons.map((info, index) => (
                                    <HackathonCard 
                                        key={info.hackathon_id} 
                                        info={info} 
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    />
                                ))
                            ) : (
                                <div className="md:col-span-2 xl:col-span-3 text-center py-16 px-6 bg-white rounded-lg shadow-md border border-gray-200">
                                    <SearchIcon />
                                    <h3 className="mt-4 text-2xl font-bold text-gray-800">No Hackathons Found</h3>
                                    <p className="text-gray-600 mt-2">Try adjusting your search or filter criteria.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
            
            {/* UNCHANGED: Original Floating Action Button */}
            <div className="fixed bottom-8 right-8">
                <button className="bg-[#003E4D] text-white w-20 h-20 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-90 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

const Hackathons = () => {
    return <HackathonSearchPage />;
};

export default Hackathons;