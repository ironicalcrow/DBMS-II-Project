import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
    Calendar, Globe, Users, Tag, ChevronRight, Gavel, 
    UsersRound, PlusCircle, LogIn, CheckCircle, Award 
} from 'lucide-react';
import axios from 'axios';
import { userContext } from '../hooks/AutoAuth';

const getHackathonStatus = (startDateStr, endDateStr) => {
    const now = new Date();
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (now > end) {
        return { text: 'Hackathon Ended', classes: 'bg-red-100 text-red-700' };
    } else if (now >= start && now <= end) {
        const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return { text: `Running • ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`, classes: 'bg-green-100 text-green-700 animate-pulse' };
    } else {
        const daysLeft = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
        return { text: `Starts in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`, classes: 'bg-blue-100 text-blue-700' };
    }
};

const ViewHackathonPage = () => {

    const userC = userContext();
    const location = useLocation();
    const navigate = useNavigate();
    const hackathon = location?.state;
    const User = location?.state?.User || 'host';
    const [hasproject, sethasproject] = useState(0);
    console.log(userC?.User)

    if (hackathon === null) return <div className="min-h-screen bg-[#E9F0FF] flex items-center justify-center">Nothing to show</div>;
    if (hackathon.hackathon != null) localStorage.setItem('tempP', JSON.stringify(hackathon.hackathon));
    console.log(User)
    const finalData = location?.state?.finalData || JSON.parse(localStorage.getItem('tempP'));
    console.log(finalData)
    const status = getHackathonStatus(finalData.starting_date, finalData.ending_date);
    
   
    const isJoinable = status.text.includes('Running');

    const now = new Date();
    const start = new Date(finalData.starting_date);
    const end = new Date(finalData.ending_date);
    const progressPercent = now < start ? 0 : now > end ? 100 : ((now - start) / (end - start)) * 100;

    useEffect(() => {
        const ifhasproject = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/project/${finalData.hackathon_id}/user/${userC.User.user.username}`);
                const pval = response.data?.data?.projects?.length || 0;
                sethasproject(pval);
            } catch (error) {
                console.error("Failed to check for existing project:", error);
                sethasproject(0);
            }
        };
        if (User.toLowerCase() === 'participant' && userC?.User?.user?.username) {
            ifhasproject();
        }
    }, [User, finalData.hackathon_id, userC.User]);

    const addproject = async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:4000/api/participation/hackathon/${finalData.hackathon_id}/my-team`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const team = response.data[0];
        navigate('/projectforhackathon', { state: { team } });
    };

    const participantform = () => {
        const hackathon_id = finalData.hackathon_id;
        navigate('/participantform', { state: { hackathon_id } });
    };

    const navItems = [
        { name: "Overview", href: "#" },
        { name: "My Projects", href: "/profileinfo" },
        { name: "Participants", href: "/projectteams" },
        { name: "Rules", href: finalData?.rule_book, isExternal: true },
    ];
    
    const InfoItem = ({ icon, label, value }) => (
        <div className="flex items-center justify-between text-gray-700">
            <span className="flex items-center"><span className="text-gray-500">{icon}</span><span className="ml-3">{label}</span></span>
            <span className="font-bold text-gray-900">{value}</span>
        </div>
    );

    return (
        <div className="bg-[#E9F0FF] min-h-screen font-sans">
            <div className="relative h-[50vh] min-h-[400px] w-full">
                <img src={finalData.hackathon_image} className="absolute inset-0 w-full h-full object-cover" alt="Hackathon Banner" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl font-extrabold tracking-tight drop-shadow-2xl">{finalData?.hackathon_name}</h1>
                    <p className={`mt-6 text-lg font-bold px-5 py-2 rounded-full ${status.classes} shadow-lg`}>{status?.text}</p>
                </div>
            </div>

            <div className="-mt-20 relative z-10">
                <div className="bg-white shadow-lg">
                    <nav className="border-b border-gray-200">
                        <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-32">
                            <div className="flex items-center justify-start h-20">
                                <div className="flex items-center space-x-6 sm:space-x-8">
                                    {navItems.map((item) => {
                                        const isActive = item.name === 'Overview';
                                        return (
                                            <a 
                                                key={item.name} 
                                                href={item.href} 
                                                target={item.isExternal ? "_blank" : "_self"} 
                                                rel="noopener noreferrer" 
                                                className={`relative group cursor-pointer py-2 text-base sm:text-lg transition-colors duration-300 ${isActive ? 'font-semibold text-blue-600' : 'font-medium text-gray-600 hover:text-blue-600'}`}
                                            >
                                                {item.name}
                                                <span className={`absolute left-0 -bottom-1 h-1 bg-blue-600 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </nav>

                    <main className="bg-white py-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-32">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 xl:gap-x-16 gap-y-16">
                            <div className="lg:col-span-8 space-y-16">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Actions</h2>
                                    <div className="flex flex-wrap gap-4">
                                        {userC?.User?(
                                         User.toLowerCase() === 'host' ? (
                                            <>
                                                <button onClick={() => navigate('/markingpage', { state: { id: finalData.hackathon_id,hname:finalData.hackathon_name } })} className="flex items-center gap-2 bg-[#6D8EF2] text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:-translate-y-1 hover:shadow-xl"><Users /> View Leaderboard</button>
                                                <Link to={'/judges'} state={{ ID: finalData?.hackathon_id }} className="flex items-center gap-2 bg-[#6D8EF2] text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:-translate-y-1 hover:shadow-xl"><Gavel /> View Judges</Link>
                                                <button onClick={() => navigate('/projectteams', { state: { hid: finalData } })} className="flex items-center gap-2 bg-[#6D8EF2] text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:-translate-y-1 hover:shadow-xl"><UsersRound /> View Teams</button>
                                            </>
                                        ):
                                        User.toLowerCase() === 'judge'?(
                                            <>
                                                 <button onClick={() => navigate('/markingpage', { state: { id: finalData.hackathon_id } })} className="flex items-center gap-2 bg-[#6D8EF2] text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:-translate-y-1 hover:shadow-xl"><Users /> View Leaderboard</button>
                                                <button onClick={() => navigate('/projectteams', { state: { hid: finalData } })} className="flex items-center gap-2 bg-[#6D8EF2] text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:-translate-y-1 hover:shadow-xl"><UsersRound /> View Teams</button>
                                            </>
                                        ):
                                        User.toLowerCase() === 'participant' ?(
                                            <button onClick={addproject} disabled={hasproject > 0} className="flex items-center gap-2 bg-[#6D8EF2] text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:-translate-y-1 hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"><PlusCircle /> {hasproject > 0 ? "Project Submitted" : "Add Project"}</button>
                                        ):
                                        
                                
                                        User === 'No Role' && (
                                            <button 
                                                onClick={participantform} 
                                                disabled={!isJoinable}
                                                className="flex items-center gap-2 bg-[#4060C1] text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:-translate-y-1 hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                            >
                                                <LogIn /> 
                                                { isJoinable
                                                    ? 'Join Hackathon' 
                                                    : (status.text.includes('Ended') ? 'Hackathon Ended' : 'Registration Not Open')}
                                            </button>
                                        )
                                        ):( <button onClick={() => navigate('/login')} className="flex items-center gap-2 bg-[#6D8EF2] text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:-translate-y-1 hover:shadow-xl">Login</button>)}
                                    </div>
                                </div>
                                
                                <div>
                                    <h2 id="overview" className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Overview</h2>
                                    <div className="prose prose-lg max-w-full text-gray-600 space-y-4">
                                        <p>Welcome to <strong>{finalData?.hackathon_name}</strong>! This is where innovation meets collaboration. Get ready to build amazing projects, learn new skills, and connect with fellow developers from around the globe.</p>
                                        <p>This year's theme focuses on a pressing challenge, and we are looking for groundbreaking solutions. We challenge you to push the boundaries of technology to create projects that are not only innovative but also impactful. Whether you're a seasoned developer, a creative designer, or just starting, this is your platform to shine, experiment, and bring your ideas to life.</p>
                                        <p>Join us for an exciting journey of creation, learning, and friendly competition!</p>
                                    </div>
                                </div>
                            </div>

                            <aside className="lg:col-span-4 space-y-8">
                                <div className="bg-gray-50/70 p-6 rounded-xl border border-gray-200">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Timeline</h3>
                                    <div>
                                        <div className="flex justify-between items-center mb-1"><span className="text-sm font-medium text-gray-600">Progress</span><span className="text-sm font-bold text-green-600">{Math.round(progressPercent)}%</span></div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div></div>
                                    </div>
                                    <div className="mt-6 space-y-4 text-gray-800">
                                        <div className="flex items-center"><Calendar className="h-5 w-5 text-gray-500 flex-shrink-0" /><p className="ml-3 font-semibold">Starts: {new Date(finalData.starting_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
                                        <div className="flex items-center"><Calendar className="h-5 w-5 text-gray-500 flex-shrink-0" /><p className="ml-3 font-semibold">Ends: {new Date(finalData.ending_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50/70 p-6 rounded-xl border border-gray-200 space-y-4">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Details</h3>
                                    <InfoItem icon={<Globe size={20} />} label="Mode" value="Online" />
                                    <InfoItem icon={<Tag size={20} />} label="Genre" value={finalData?.genre || 'N/A'} />
                                    <InfoItem icon={<Users size={20} />} label="Participants" value="0" />
                                </div>

                                <div className="bg-gray-50/70 p-6 rounded-xl border border-gray-200">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Judging Criteria</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {finalData?.judging_criteria?.length > 0 ? finalData.judging_criteria.map(tag => (
                                            <span key={tag.criteriainfo} className="bg-sky-100 text-sky-800 text-sm font-semibold px-4 py-2 rounded-full flex items-center border border-sky-200"><Award className="h-4 w-4 mr-2" />{tag.criteriainfo}</span>
                                        )) : (
                                            <p className="text-sm text-gray-500">Criteria not specified.</p>
                                        )}
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </main>
                </div>
            </div>
            <div className="bg-white h-1"></div>
        </div>
    );
};

export default ViewHackathonPage;