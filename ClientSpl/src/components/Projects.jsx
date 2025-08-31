import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/ProjectContext';
import { Tag, Calendar, Github, ExternalLink, Lightbulb, Search, SlidersHorizontal } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Img1 from '../Images/img1.jpg'
import Img2 from '../Images/img2.jpeg'
import Img3 from '../Images/img3.jpeg'
import Img4 from '../Images/img4.jpg'
import Img5 from '../Images/img5.jpg'
import Img6 from '../Images/img6.jpeg'
import Img7 from '../Images/img7.jpeg'
import Img8 from '../Images/img8.jpg'
import Img9 from '../Images/img9.jpg'
import Img10 from '../Images/img10.jpg'
 
const FilterGroup = ({ title, children }) => (
    <div>
        <h3 className="font-semibold text-base text-gray-800 mb-4">{title}</h3>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);
const parseFeatures = (featuresString) => {
    if (typeof featuresString !== 'string' || !featuresString) {
        return [];
    }
    try {
        const features = JSON.parse(featuresString);
        return Array.isArray(features) ? features : [];
    } catch (error) {
        console.error("Failed to parse features:", error);
        return [];
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (error) {
        return 'Invalid Date';
    }
};

const ProjectCard = ({ project }) => {
    const images = [Img1,Img2,Img3,Img4,Img5,Img6,Img7,Img8,Img9,Img10]
    
    const navigate = useNavigate();
    const features = parseFeatures(project.features);

    const handleCardClick = () => {
        console.log(project)
        navigate(`/viewproject`,{state:{project}});
    };

    return (
        <div 
            onClick={handleCardClick}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col cursor-pointer"
        >
            <div className="w-full h-32 bg-gray-200">
                <img
                    src={images[Math.floor(Math.random() * 9) + 1]}
                    alt={`${project.project_name} preview`}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{project.project_name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">{project.project_genre}</span>
                </div>

                <div className="flex items-center text-xs text-gray-500 mb-3">
                    <Calendar size={12} className="mr-1.5" />
                    <span>{formatDate(project.creation_date)}</span>
                </div>

                <p className="text-gray-600 mb-3 flex-grow text-xs line-clamp-2">{project.overview}</p>

                 <div className="flex items-start text-xs text-gray-600 italic mb-4 p-2 bg-amber-50 rounded-md">
                    <Lightbulb size={16} className="mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="line-clamp-2">{project.motivation}</p>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-500 mb-2 text-xs">Features</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {features.length > 0 ? (
                            features.slice(0, 3).map((feature, index) => ( // Show max 3 features
                                <span key={index} className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                                    <Tag size={10} className="mr-1" />
                                    {feature}
                                </span>
                            ))
                        ) : (
                            <p className="text-xs text-gray-500">No features listed.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-3 flex justify-end items-center gap-2 border-t">
                <a href={project.git_repo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">
                    <Github size={14} />
                    GitHub
                </a>
                <a href={project.demo_link} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors ${project.demo_link ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`} onClick={(e) => !project.demo_link && e.preventDefault()}>
                    <ExternalLink size={14} />
                    Demo
                </a>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const ProjectSearchPage = () => {
    const { projects, Loading } = useProjects();

    // State for filters and search
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [activeSort, setActiveSort] = useState('relevant'); // 'relevant' or 'submission'
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        let tempProjects = projects || [];

        // 1. Apply search filter
        if (searchTerm.trim() !== '') {
            const lowercasedTerm = searchTerm.toLowerCase();
            tempProjects = tempProjects.filter(p =>
                p.project_name.toLowerCase().includes(lowercasedTerm) ||
                (p.overview && p.overview.toLowerCase().includes(lowercasedTerm))
            );
        }

        // 2. Apply genre filter
        if (selectedGenre) {
            tempProjects = tempProjects.filter(p => p.project_genre === selectedGenre);
        }

        // 3. Apply sorting
        const sortedProjects = [...tempProjects];
        if (activeSort === 'submission') {
            sortedProjects.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date));
        }
        // 'relevant' sort doesn't change the order from the filtered list

        setFilteredProjects(sortedProjects);

    }, [projects, searchTerm, selectedGenre, activeSort, Loading]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedGenre('');
        setActiveSort('relevant');
    };

    if (Loading) {
        return <div className="text-center p-10 font-bold text-xl">Loading Projects...</div>;
    }

    return (
        <div className="bg-[#E9F0FF] min-h-screen font-sans">
            <header className="bg-[#6D8EF2] text-white py-16 sm:py-20 lg:py-24">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">Explore Projects & Test Your Skills</h1>
                </div>
            </header>

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="relative flex items-center mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-6 w-6 text-gray-400" />
                    </div>
                    <input 
                        type="search" 
                        placeholder="Search by project title or keyword" 
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="mb-8">
                    <button onClick={() => setShowFilters(!showFilters)} className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-4 rounded-lg text-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                        <SlidersHorizontal size={20} />
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </button>

                    {showFilters && (
                        <div className="mt-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Filters</h2>
                                <button onClick={handleClearFilters} className="text-base text-blue-600 hover:underline">Clear All</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                                <FilterGroup title="Managed by DevFiesta">
                                    <label className="flex items-center space-x-3 text-gray-700 hover:text-black cursor-pointer">
                                        <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <span className="text-base">Managed by DevFiesta</span>
                                    </label>
                                </FilterGroup>
                                <FilterGroup title="Genre">
                                     <select
                                        className="w-full p-3 border border-gray-300 rounded-lg text-base"
                                        value={selectedGenre}
                                        onChange={(e) => setSelectedGenre(e.target.value)}
                                    >
                                        <option value="">All Genres</option>
                                        <option value="Web">Web</option>
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
                        </div>
                    )}
                </div>

                <main>
                    <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-300 pb-5 mb-8">
                        <p className="text-base text-gray-600 mb-4 sm:mb-0">Showing {filteredProjects.length} projects</p>
                        <div className="flex items-center gap-3 text-base">
                            <span className="font-semibold">Sort:</span>
                            <button 
                                onClick={() => setActiveSort('relevant')}
                                className={`px-3 py-1 rounded-md ${activeSort === 'relevant' ? 'text-blue-600 font-bold bg-blue-100' : 'text-gray-600 hover:text-black'}`}
                            >
                                Most relevant
                            </button>
                            <button 
                                onClick={() => setActiveSort('submission')}
                                className={`px-3 py-1 rounded-md ${activeSort === 'submission' ? 'text-blue-600 font-bold bg-blue-100' : 'text-gray-600 hover:text-black'}`}
                            >
                                Submission date
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                                <ProjectCard key={project.project_id} project={project} />
                            ))
                        ) : (
                             <div className="col-span-full text-center py-16 px-6 bg-white rounded-lg shadow-md">
                                <h3 className="text-2xl font-bold text-gray-800">No Projects Found</h3>
                                <p className="text-gray-600 mt-2">Try adjusting your search or filter criteria.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            
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

const Project = () => {
    return <ProjectSearchPage />;
}

export default Project;
