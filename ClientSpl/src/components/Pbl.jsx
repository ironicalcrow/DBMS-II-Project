import React, { useEffect, useState } from 'react';
import { Globe, Users, Search, X } from 'lucide-react';
import { usePbls } from '../hooks/PblContext'; // Assuming this hook exists and works
import { userContext } from '../hooks/AutoAuth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

const getpblstatus = (startDateStr, endDateStr) => {
    const now = new Date();
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);

    if (now > end) return { text: 'Ended' };
    if (now >= start) return { text: 'Running' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventStartDate = new Date(startDateStr);
    eventStartDate.setHours(0, 0, 0, 0);

    const diffTime = eventStartDate - today;
    const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) return { text: 'Upcoming', timeLeft: 'Starts today' };
    if (daysLeft === 1) return { text: 'Upcoming', timeLeft: 'Starts tomorrow' };
    return { text: 'Upcoming', timeLeft: `${daysLeft} days left` };
};

const getStatusClasses = (statusText) => {
    switch (statusText) {
        case 'Running': return 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-600/20';
        case 'Ended': return 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-600/20';
        case 'Upcoming': return 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-600/20';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// --- LOGIN POPUP (Unchanged) ---
const LoginFormPopup = ({ isOpen, onClose, pbl }) => {
    const [role, setRole] = useState('student');
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen) {
            setRole('student');
            setStudentId('');
            setPassword('');
        }
    }, [isOpen]);

    if (!isOpen || !pbl) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const spldata = pbl;
        let temp_role = ''
        try {
            const token =localStorage.getItem('token')
            const response = await axios.get(
                `http://localhost:4000/api/pbl/${pbl.pbl_id}/role`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            temp_role = response?.data?.data?.role[0].role.toLowerCase();
            console.log('temp_role ',temp_role)

        } catch (error) {
            alert('Verification failed. You may have to login first.');
            console.error(error);
        }
        if (temp_role === 'no role') {
            alert('You request is denied')
        }
        else {

            switch (role) {
                case 'student':
                    if (password === pbl.student_pass)
                        
                        navigate('/newstudentpersonal', { state: { studentId, pbl } });
                    else {
                        alert('Invalid Password')
                    }
                    break;
                case 'host':
                    const token = localStorage.getItem('token')
                    try {
                        const response = await axios.get(
                            `http://localhost:4000/api/pbl/${pbl.pbl_id}/role`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );
                        if (response?.data?.data?.role[0].role.toLowerCase() === 'host')
                            navigate('/newspladminpage', { state: { spldata } });
                        else {
                            alert('Invalid Credentials')
                        }
                    } catch (error) {
                        alert('Verification failed. You may not have host privileges.');
                        console.error(error);
                    }
                    break;
                case 'supervisor':
                    if (password === pbl.supervisor_pass)
                        navigate('/newsupervisordashboard', { state: { spldata } });
                    else {
                        alert('Invalid Password')
                    }
                    break;
                case 'judge':
                    if (password === pbl.judge_pass)
                        navigate('/judgepagespl', { state: { spldata } });
                    else {
                        alert('Invalid Password')
                    }
                    break;
                default:
                    alert("Invalid role selected.");
                    return;
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md m-4 transform transition-all">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 truncate" title={pbl.pbl_name}>Login to: {pbl.pbl_name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-4">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option value="student">Student</option>
                            <option value="host">Host</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="judge">Judge</option>
                        </select>
                    </div>
                    {role === 'student' && (
                        <div>
                            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student ID</label>
                            <input type="text" id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                    )}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- NEW REGISTER POPUP ---
const RegisterFormPopup = ({ isOpen, onClose, pbl, username }) => {
    const [role, setRole] = useState('student');
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setRole('student');
            setStudentId('');
            setPassword('');
        }
    }, [isOpen]);

    if (!isOpen || !pbl) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const pbl_id = pbl.pbl_id;
        let url = '';
        let payload = {};

        switch (role) {
            case 'student':
                url = 'http://localhost:4000/api/pbl/insert-student';
                payload = { pbl_id, student_username: username, student_id: studentId, password };
                break;
            case 'supervisor':
                url = 'http://localhost:4000/api/pbl/insert-supervisor';
                payload = { pbl_id, supervisor_username: username, supervisor_pass: password };
                break;
            case 'judge':
                url = 'http://localhost:4000/api/pbl/insert-judge';
                payload = { pbl_id, judge_username: username, judge_pass: password };
                break;
            default:
                alert("You can only register as a Student, Supervisor, or Judge.");
                return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(url, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200 || response.status === 201) {
                alert('Registration Successful!');
                onClose();
            }
        } catch (error) {
            console.error(`Registration failed for role "${role}":`, error.response?.data || error.message);
            alert(`Error: ${error.response?.data?.message || 'Registration failed.'}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md m-4 transform transition-all">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 truncate" title={pbl.pbl_name}>Register for: {pbl.pbl_name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-4">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="role-register" className="block text-sm font-medium text-gray-700">Role</label>
                        <select id="role-register" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option value="student">Student</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="judge">Judge</option>
                        </select>
                    </div>
                    {role === 'student' && (
                        <div>
                            <label htmlFor="studentId-register" className="block text-sm font-medium text-gray-700">Student ID</label>
                            <input type="text" id="studentId-register" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                    )}
                    <div>
                        <label htmlFor="password-register" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" id="password-register" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};


const PblCard = ({ info, style, onLoginClick, onRegisterClick }) => {
    const status = getpblstatus(info.proposal_Date, info.final_presentation);
    const statusClasses = getStatusClasses(status.text);

    return (
        <div style={style} className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-200 hover:border-blue-500 card-enter flex flex-col justify-between">
            <div>
                <div className="relative">
                    <img src={info.pbl_image || `https://placehold.co/600x250/6D8EF2/FFFFFF?text=${encodeURIComponent(info.pbl_name)}`} alt={`${info.pbl_name} banner`} className="w-full h-40 object-cover" />
                    <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full ${statusClasses}`}>{status.text}</span>
                </div>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 truncate mb-3 group-hover:text-blue-600 transition-colors">{info.pbl_name}</h3>
                    <div className="flex items-center text-gray-600 text-sm space-x-5 mb-4">
                        <span className="flex items-center"><Globe size={14} className="mr-1.5" /> {info.genre || 'General'}</span>
                        <span className="flex items-center"><Users size={14} className="mr-1.5" /> Participants</span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">{status.text === 'Upcoming' ? status.timeLeft : `Ends: ${new Date(info.final_presentation).toLocaleDateString()}`}</p>
                </div>
            </div>
            <div className="p-6 pt-0 grid grid-cols-2 gap-3">
                <button onClick={() => onRegisterClick(info)} className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300">
                    Register
                </button>
                <button onClick={() => onLoginClick(info)} className="w-full bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300">
                    Login
                </button>
            </div>
        </div>
    );
};

const PblSearchPage = () => {
    const { pbls, loading } = usePbls();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [activeSort, setActiveSort] = useState('');
    const [filteredPbls, setFilteredPbls] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false); // State for register popup
    const [selectedPbl, setSelectedPbl] = useState(null);
    const { User } = userContext();

    useEffect(() => {
        let tempPbls = pbls || [];
        if (searchTerm.trim() !== '') tempPbls = tempPbls.filter(p => p.pbl_name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (selectedGenre) tempPbls = tempPbls.filter(p => p.genre === selectedGenre);
        if (selectedStatuses.length > 0) {
            tempPbls = tempPbls.filter(p => {
                const status = getpblstatus(p.proposal_Date, p.final_presentation);
                return selectedStatuses.includes(status.text);
            });
        }
        const sortedPbls = [...tempPbls];
        if (activeSort === 'submission') sortedPbls.sort((a, b) => new Date(a.final_presentation) - new Date(b.final_presentation));
        else if (activeSort === 'recent') sortedPbls.sort((a, b) => new Date(b.added_date) - new Date(a.added_date));
        setFilteredPbls(sortedPbls);
    }, [searchTerm, selectedGenre, selectedStatuses, activeSort, pbls]);

    const handleStatusChange = (event) => {
        const { value, checked } = event.target;
        setSelectedStatuses(prev => checked ? [...prev, value] : prev.filter(s => s !== value));
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedGenre('');
        setSelectedStatuses([]);
        setActiveSort('');
    };

    const handleLoginClick = (pbl) => {
        setSelectedPbl(pbl);
        setShowLogin(true);
    };

    const handleRegisterClick = (pbl) => {
        setSelectedPbl(pbl);
        setShowRegister(true);
    };

    const handleCloseLogin = () => {
        setShowLogin(false);
        setSelectedPbl(null);
    };

    const handleCloseRegister = () => {
        setShowRegister(false);
        setSelectedPbl(null);
    };

    if (loading) {
        return <div className="text-center p-10 font-bold text-xl bg-[#E9F0FF] min-h-screen">Loading PBLs...</div>;
    }

    return (
        <div className="bg-[#E9F0FF] min-h-screen font-sans">
            <style>{`.card-enter { animation: fadeInUp 0.5s ease-out forwards; } @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            <header className="bg-gradient-to-br from-[#4060C1] to-[#6D8EF2] text-white py-20 sm:py-24">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">Find Your Next Challenge</h1>
                    <p className="mt-4 text-lg text-indigo-200 max-w-2xl mx-auto">Explore PBLs, showcase your skills, and bring your ideas to life.</p>
                </div>
            </header>
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="relative flex items-center mb-10">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><SearchIcon /></div>
                    <input type="search" placeholder="Search by PBL title or keyword..." className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg transition" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
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
                        </div>
                    </aside>
                    <main className="lg:col-span-9">
                        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-8">
                            <p className="text-base text-gray-700 font-medium mb-4 sm:mb-0">Showing {filteredPbls.length} PBLs</p>
                            <div className="flex items-center gap-2 text-base">
                                <span className="font-semibold text-gray-800">Sort:</span>
                                <button onClick={() => setActiveSort('submission')} className={`px-4 py-1.5 rounded-full font-medium transition-all duration-200 ${activeSort === 'submission' ? 'text-white bg-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>Submission date</button>
                                <button onClick={() => setActiveSort('recent')} className={`px-4 py-1.5 rounded-full font-medium transition-all duration-200 ${activeSort === 'recent' ? 'text-white bg-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>Recently added</button>
                            </div>
                        </div>
                        <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden w-full mb-6 bg-white text-gray-800 font-semibold py-3 px-4 rounded-lg text-lg shadow-sm border border-gray-200">{showFilters ? 'Hide Filters' : 'Show Filters'}</button>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {filteredPbls.length > 0 ? (
                                filteredPbls.map((info, index) => (
                                    <PblCard
                                        key={info.pbl_id}
                                        info={info}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                        onLoginClick={handleLoginClick}
                                        onRegisterClick={handleRegisterClick}
                                    />
                                ))
                            ) : (
                                <div className="md:col-span-2 xl:col-span-3 text-center py-16 px-6 bg-white rounded-lg shadow-md border border-gray-200">
                                    <SearchIcon />
                                    <h3 className="mt-4 text-2xl font-bold text-gray-800">No PBLs Found</h3>
                                    <p className="text-gray-600 mt-2">Try adjusting your search or filter criteria.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
            <LoginFormPopup isOpen={showLogin} onClose={handleCloseLogin} pbl={selectedPbl} />
            <RegisterFormPopup isOpen={showRegister} onClose={handleCloseRegister} pbl={selectedPbl} username={User?.user?.username} />
        </div>
    );
};

export default PblSearchPage;