import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userContext } from '../hooks/AutoAuth';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaGithub } from "react-icons/fa6";
import { FaTag } from "react-icons/fa";
import ProfileLogo from '../Images/img4.jpg'
import Card from '../Images/Card.png'

const GitHubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-black transition-colors duration-300">
      <FaGithub  size={'22'}/>
    </svg>
);

const TagIcon = () => (
     <svg  xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <FaTag  size={'22'}/>
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform transition-transform duration-300 group-hover:translate-x-1">
        <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

const StatItem = ({ value, label, onClick, isActive }) => (
    <div onClick={onClick} className={`text-center cursor-pointer p-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-800 hover:bg-gray-100'}`}>
        <p className="text-lg md:text-xl 2xl:text-2xl font-bold">{value}</p>
        <p className="text-[10px] sm:text-xs 2xl:text-sm font-semibold tracking-wider">{label}</p>
    </div>
);


const ProjectCard = ({ project }) => {
    const goto = useNavigate();

    const handleViewProject = () => {
        console.log('Navigating to view project:', project);
        goto('/viewproject', { state: { project } });
    };

    
    const placeholderText = encodeURIComponent(project.project_genre || 'Project');

    return (
        <div className="group flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          
            <div className="h-48 overflow-hidden">
                <img
                    src={Card}
                    alt={`Visual representation of ${project.project_name}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>

       
            <div className="p-6 flex flex-col flex-grow">
                <div>
                    <p className="text-blue-600 font-semibold text-sm mb-1">{project.project_genre}</p>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{project.project_name}</h3>
                    <p className="text-gray-500 text-sm h-20 overflow-hidden text-ellipsis">{project.overview}</p>
                </div>

             
                <div className="mt-auto pt-4 flex justify-between items-center">
                    <a
                        href={project.git_repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-800 transition-colors"
                        aria-label={`View ${project.project_name} on GitHub`}
                    >
                        <GitHubIcon />
                    </a>
                    <button
                        onClick={handleViewProject}
                    
                        className="text-blue-600 font-semibold text-sm flex items-center gap-2"
                    >
                        View Project
                        <ArrowRightIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};



const HackathonCard = ({ hackathon }) => {
    const [role,setrole]=useState('No Role')
    const token =localStorage.getItem('token')
    console.log(hackathon)
    const getrole=async()=>{
         const response = await axios.get(`http://localhost:4000/api/hackathon/role/${hackathon.hackathon_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        console.log(response.data.data.role[0].role)
        setrole(response.data.data.role[0].role)
    }
    console.log(hackathon)
    const goto = useNavigate();
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div>
                <img src={hackathon.hackathon_image}></img>
            </div>
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{hackathon.hackathon_name}</h3>
                <p className="text-sm font-medium text-purple-600 mb-4">{hackathon.theme}</p>
                <p className="text-gray-600 text-sm h-20 overflow-hidden">{hackathon.overview}</p>
            </div>
            <div className="bg-gray-50 px-6 py-3">
                <a onClick={() =>{getrole(); goto('/viewhackathon', { state: { hackathon ,User:role} })}} className="text-blue-500 hover:underline font-semibold text-sm cursor-pointer">View Hackathon</a>
            </div>
        </div>
    )
};


const PortfolioPage = () => {
    const navigateto = useNavigate();
    const { User, loading } = userContext();

    const [activeTab, setActiveTab] = useState('projects');

    const [projects, setProjects] = useState([]);
    const [projectlength, setProjectlength] = useState(0);

    const [hackathons, setHackathons] = useState([]);
    const [hackathonlength, setHackathonlength] = useState(0);

    const [judgedhackathons, setjudgedHackathons] = useState([]);
    const [judgedhackathonlength, setjudgedHackathonlength] = useState(0);

    const [judgedalltime, setjudgedalltime] = useState([]);
    const [judgedalltimelength, setjudgedalltimelength] = useState(0);


    

    useEffect(() => {
        const fetchProjects = async (username, token) => {
            try {
                console.log(username);
                const response = await axios.get(
                    'http://localhost:4000/api/project/my-projects',
                    {
                        params: { username },
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        withCredentials: true
                    }
                );
                const projectrecieved = response.data.data.projects || [];
                setProjects(projectrecieved);
                setProjectlength(projectrecieved.length);
                console.log("Projects received:", projectrecieved);
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };


        const fetchHackathons = async (username, token) => {
            try {

                console.log(token)
                const response = await axios.get('http://localhost:4000/api/hackathon/my-hackathons', {
                    params: { username },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                });

                const hackathonsReceived = response.data.data.hackathons || [];
                setHackathons(hackathonsReceived);
                setHackathonlength(hackathonsReceived.length);
                console.log("Hackathons received:", hackathonsReceived);
            } catch (error) {
                console.error('Error fetching hackathons:', error);
                const mockHackathons = [

                ];
                setHackathons(mockHackathons);
                setHackathonlength(mockHackathons.length);
            }
        };
         const fetchjudgedhackathons = async (username, token) => {
            try {

                console.log(token)
                const response = await axios.get('http://localhost:4000/api/hackathon/my-judged', {
                    params: { username },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                });
                console.log('dekhi ki paisi')
                const judgedhackathonsReceived = response.data.data.hackathons || [];
                setjudgedHackathons(judgedhackathonsReceived);
                setjudgedHackathonlength(judgedhackathonsReceived.length);
                console.log("Judged  Hackathons received:", judgedhackathonsReceived);
            } catch (error) {
                console.error('Error fetching Judged  hackathons:', error);
                const mockHackathons = [

                ];
                setjudgedHackathons(mockHackathons);
                setjudgedHackathonlength(mockHackathons.length);
            }
        };
        const fetchjudgedalltime = async (username, token) => {
            try {

                console.log(token)
                const response = await axios.get('http://localhost:4000/api/hackathon/my-all-judged-hackathons', {
                    params: { username },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                });
                console.log('dekhi ki paisi')
                const judgedalltimeReceived = response.data.data.hackathons || [];
                setjudgedalltime(judgedalltimeReceived);
                setjudgedalltimelength(judgedalltimeReceived.length);
                console.log("Judged  Hackathons received:", judgedalltimeReceived);
            } catch (error) {
                console.error('Error fetching Judged  hackathons:', error);
                const mockHackathons = [

                ];
                setjudgedalltime(mockHackathons);
                setjudgedalltimelength(mockHackathons.length);
            }
        };
        const getrole=async ()=>{

        }

        const token = localStorage.getItem('token');
        const projectUser = JSON.parse(localStorage.getItem('user'));
        console.log(projectUser)
        const username = projectUser?.user?.username;

        if (username && token) {
            getrole(username,token)
            fetchProjects(username, token);
            fetchHackathons(username, token);
            fetchjudgedhackathons(username,token)
            fetchjudgedalltime(username,token)
        }
    }, []);

    if (loading) {
        return <div className="flex bg-[#E9F0FF] justify-center items-center h-screen text-xl">Loading profile...</div>;
    }

    const placeholderText = User?.user?.username ? User?.user?.username.slice(0, 2).toUpperCase() : '..';
    const profileImage = User?.user?.image || `https://placehold.co/192x192/EFEFEF/333333?text=${placeholderText}`;

    return (
        <div className="bg-[#E9F0FF] min-h-screen font-sans">
            <div className="w-full max-w-6xl mx-auto p-2 sm:p-4 xl:max-w-7xl 2xl:max-w-none 2xl:px-32">
                <div className="md:relative">
                    <div className="h-32 md:h-48 xl:h-56 2xl:h-64 bg-[#6D8EF2] rounded-t-lg flex justify-end items-start p-2 sm:p-4">
                    </div>

                    <div className="flex flex-col items-center -mt-16 md:flex-row md:items-end md:absolute md:top-24 md:left-8 xl:top-28 xl:left-12 2xl:top-36 2xl:left-16 md:gap-6">
                        <div className="w-28 h-28 md:w-40 md:h-40 xl:w-44 xl:h-44 2xl:w-48 2xl:h-48 rounded-full bg-gray-300 border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
                            <img
                                src={profileImage}
                                alt={`${User?.full_name || 'User'}'s profile picture`}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="text-center md:text-left mt-2 md:mt-0 md:pb-4 xl:pb-6 2xl:pb-8">
                            <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold text-gray-800">
                                {User?.full_name}
                                <span className="text-lg md:text-xl xl:text-2xl  text-white font-bold block  sm:inline"> {User?.user?.username}</span>
                            </h1>
                            <Link to={'/settings'} className="text-sm xl:text-base text-white hover:underline mt-1 block">
                                Edit your personal info, bio, and location.
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-b-lg shadow-md pt-4 md:pt-24 xl:pt-28 2xl:pt-32 px-4 sm:px-8 xl:px-12 pb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 md:mt-0 mb-8 xl:mb-10">
                        <button onClick={()=>{navigateto('/settings')}} className="w-full sm:w-auto bg-[#4060C1] text-white font-semibold py-2 px-4 xl:py-3 xl:px-5 xl:text-lg rounded-md hover:bg-blue-600 transition-colors duration-200">
                            Edit info & settings
                        </button>
                        <button onClick={() => { navigateto('/addproject') }} className="w-full sm:w-auto bg-[#BCCDFF] text-black font-semibold py-2 px-4 xl:py-3 xl:px-5 xl:text-lg rounded-md hover:bg-blue-600  hover:text-white transition-colors duration-200">
                            Add a new project
                        </button>
                    </div>

                    <div className="border-t border-gray-200 pt-4 xl:pt-6">
                        <div className="grid grid-cols-2 gap-2 text-center md:flex md:justify-start md:text-left md:gap-8 xl:gap-12">
                            <StatItem value={projectlength} label="PROJECTS" onClick={() => setActiveTab('projects')} isActive={activeTab === 'projects'} />
                            <StatItem value={hackathonlength} label="HACKATHONS" onClick={() => setActiveTab('hackathons')} isActive={activeTab === 'hackathons'} />
                            <StatItem onClick={()=>{setActiveTab('Judged-Hackathons')}} value={judgedhackathonlength} label="Active Judged" isActive={activeTab === 'Judged-Hackathons'} />
                             <StatItem onClick={()=>{setActiveTab('Judging-History')}} value={judgedalltimelength} label="Judging History" isActive={activeTab === 'Judging-History'} />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    {activeTab === 'projects' && (
                        <>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 px-4 sm:px-0">Projects</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {projects.map((project, index) => (
                                    <ProjectCard key={index} project={project} />
                                ))}
                            </div>
                        </>
                    )}
                    {activeTab === 'hackathons' && (
                        <>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 px-4 sm:px-0">Hackathons</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {hackathons.map((hackathon, index) => (
                                    <HackathonCard key={index} hackathon={hackathon} />
                                ))}
                            </div>
                        </>
                    )}
                     {activeTab === 'Judged-Hackathons' && (
                        <>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 px-4 sm:px-0">Judged Hackathons</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {judgedhackathons.map((judgedhackathon, index) => (
                                    <HackathonCard key={index} hackathon={judgedhackathon} />
                                ))}
                            </div>
                        </>
                    )}
                    {activeTab === 'Judging-History' && (
                        <>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 px-4 sm:px-0">Judging History</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {judgedalltime.map((judgedhackathon, index) => (
                                    <HackathonCard key={index} hackathon={judgedhackathon} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PortfolioPage;