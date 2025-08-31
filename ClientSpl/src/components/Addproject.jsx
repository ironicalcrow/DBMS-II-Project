import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PROJECTS_STORAGE_KEY = 'cofiesta_projects';
const DRAFT_PROJECT_KEY = 'cofiesta_current_project_draft';

const initialProjectState = {
    project_name: '',
    project_genre: '',
    git_repo: '',
    motivation: '',
    overview: '',
    features: []
};
const inputStyles = "w-full p-4 bg-gray-50 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200";

export default function Addproject() {
    const navigateto = useNavigate();
    const [projectData, setProjectData] = useState(initialProjectState);
    const [newFeature, setNewFeature] = useState('');

    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_PROJECT_KEY);
        if (savedDraft) {
            setProjectData(JSON.parse(savedDraft));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(DRAFT_PROJECT_KEY, JSON.stringify(projectData));
    }, [projectData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProjectData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setProjectData(prevData => ({
                ...prevData,
                features: [...prevData.features, newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const removeFeature = (indexToRemove) => {
        setProjectData(prevData => ({
            ...prevData,
            features: prevData.features.filter((_, index) => index !== indexToRemove)
        }));
    };
    
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        const User = JSON.parse(localStorage.getItem('user'));
        const username = User?.user?.username;

        if (!projectData.project_name || !projectData.project_genre) {
            alert("Please fill in the project name and genre.");
            return;
        }

        const dataToSubmit = { ...projectData, username };

        try {
            await axios.post('http://localhost:4000/api/project/create', dataToSubmit, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            const existingProjects = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
            const updatedProjects = [...existingProjects, dataToSubmit];
            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));

            alert("Project submitted successfully! 🎉");
            
            localStorage.removeItem(DRAFT_PROJECT_KEY);
            setProjectData(initialProjectState);

            navigateto('/profileinfo');
        } catch (error) {
            console.error("Submission failed:", error.response?.data || error.message);
            alert("Failed to submit project. 😔");
        }
    };

    const openRepo = () => {
        if (projectData.git_repo && /^https?:\/\//i.test(projectData.git_repo)) {
            window.open(projectData.git_repo, '_blank', 'noopener,noreferrer');
        } else {
            alert('Please enter a valid repository URL starting with http:// or https://.');
        }
    };

    return (
        <div className="bg-[#E9F0FF] min-h-screen font-sans">
            <main className="container mx-auto px-4 py-12">
                <form onSubmit={handleFormSubmit} className="max-w-5xl mx-auto flex flex-col gap-8">
                    <section className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-3 border-b">Project Info</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                            <label htmlFor="projectName" className="md:text-right text-lg font-medium text-gray-700">Project Name:</label>
                            <input id="projectName" name="project_name" type="text" value={projectData.project_name} onChange={handleChange} placeholder="Enter project name" className={`${inputStyles} md:col-span-2`} />
                            
                            <label htmlFor="projectGenre" className="md:text-right text-lg font-medium text-gray-700">Project Genre:</label>
                            <input id="projectGenre" name="project_genre" type="text" value={projectData.project_genre} onChange={handleChange} placeholder="e.g. Web App, Game, Tool" className={`${inputStyles} md:col-span-2`} />
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-3 border-b">GitHub Repository</h2>
                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-5">
                            <input name="git_repo" type="url" value={projectData.git_repo} onChange={handleChange} placeholder="Enter GitHub repo URL" className={`${inputStyles} flex-grow`} />
                            <button type="button" onClick={openRepo} className="w-full sm:w-auto bg-[#4060C1] text-white font-semibold py-4 px-6 rounded-lg hover:bg-gray-900 transition-colors duration-200 flex-shrink-0 text-lg">Open</button>
                        </div>
                        <button type="button" onClick={() => alert('Show contribution and stats popup (demo)!')} className="bg-[#4060C1] text-white font-semibold py-3 px-5 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-lg">See contribution and stats</button>
                    </section>
                    
                    <section className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-3 border-b">Motivation</h2>
                        <textarea name="motivation" value={projectData.motivation} onChange={handleChange} placeholder="What was your motivation for this project?" className={`${inputStyles} min-h-[150px]`}/>
                    </section>
                    
                    <section className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-3 border-b">Overview</h2>
                        <textarea name="overview" value={projectData.overview} onChange={handleChange} placeholder="Provide a brief overview of your project." className={`${inputStyles} min-h-[150px]`}/>
                    </section>

                    <section className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-3 border-b">Features</h2>
                        <div className="flex flex-col sm:flex-row gap-4 mb-5">
                            <input type="text" id="featureInput" placeholder="Type a new feature..." value={newFeature} onChange={e => setNewFeature(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); }}} className={`${inputStyles} flex-grow`}/>
                            <button type="button" onClick={addFeature} className="w-full sm:w-auto bg-[#4060C1] text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex-shrink-0 text-lg">Add</button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {projectData.features.length === 0 ? (
                                <p className="text-gray-500 italic mt-2 text-lg">No features added yet.</p>
                            ) : (
                                projectData.features.map((feature, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
                                        <span className="text-gray-800 text-lg">{feature}</span>
                                        <button type="button" onClick={() => removeFeature(idx)} className="text-red-500 hover:text-red-700 font-bold text-2xl leading-none p-1 rounded-full transition-colors">✕</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <div className="flex justify-center mt-6">
                        <button type="submit" className="w-full md:w-1/2 lg:w-1/3 bg-[#4060C1] hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 duration-300">Submit Project</button>
                    </div>
                </form>
            </main>
        </div>
    );
}
