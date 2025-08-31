import React from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
import { FaGithub } from "react-icons/fa";
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
import { IoLogoYoutube } from "react-icons/io";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FaLocationArrow } from "react-icons/fa6";

export default function Viewproject() {
    // --- UNCHANGED: All original logic, state, and arrays ---
    const images = [Img1,Img2,Img3,Img4,Img5,Img6,Img7,Img8,Img9,Img10]
    const location  = useLocation()
    const {project} = location?.state || '';
    console.log(location?.state?.project)

    const displayProject = project || {
        project_name: '',
        project_genre: '',
        git_repo: '',
        motivation: '',
        overview: '',
        features: [],
        imageUrl: '',
        demo_link:'' 
    };
    const dfeatures = JSON.parse(displayProject?.features)

    const openRepo = () => {
        if (displayProject.git_repo) {
            window.open(displayProject.git_repo, '_blank', 'noopener,noreferrer');
        }
    };
    const openLink=()=>{
        if(displayProject.demo_link){
            window.open(displayProject.demo_link, '_blank', 'noopener,noreferrer');
        }
    }
    

  
    return (
        <div className="bg-[#E9F0FF] min-h-screen font-sans p-4 sm:p-6 lg:p-8">
            <main className="max-w-screen-xl mx-auto">
                
                {/* --- Hero Section: Title and Showcase Image --- */}
                <header className="mb-12 text-center relative">
                    <div className="relative w-full aspect-video bg-gray-200 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden mb-6">
                        {displayProject.imageUrl ? (
                            <img src={displayProject.imageUrl} alt={`${displayProject.project_name} showcase`} className="w-full h-full object-cover" />
                        ) : (
                            // UNCHANGED: Original random image logic
                            <img src={images[Math.floor(Math.random() * 9) + 1]} alt="Project placeholder" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                    <div className="-mt-24 sm:-mt-28 md:-mt-32 relative px-6 sm:px-10 z-10 text-left">
                        <p className="text-lg font-semibold text-blue-300">{displayProject.project_genre}</p>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg">{displayProject?.project_name}</h1>
                    </div>
                </header>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* --- Main Content --- */}
                    <div className="lg:col-span-8 space-y-10">
                        <section className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">Overview</h2>
                            <p className="text-lg text-gray-700 leading-relaxed">{displayProject.overview}</p>
                        </section>

                        <section className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">Motivation</h2>
                            <p className="text-lg text-gray-700 leading-relaxed">{displayProject.motivation}</p>
                        </section>
                    </div>

                    {/* --- Sidebar --- */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-8 self-start flex flex-col gap-8">
                        <section className="bg-white p-6 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Repository</h2>
                            <button 
                                onClick={openRepo} 
                                className="w-full bg-[#4060C1] text-white font-semibold py-3 px-5 rounded-lg hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center gap-3 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-1"
                                disabled={!displayProject.git_repo}
                            >
                                <FaGithub size={'25'} />
                                <span>View on GitHub</span>
                            </button>
                               
                        </section>
                        <section className="bg-white p-6 rounded-xl shadow-lg">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Link</h2>
                                   <button 
                                onClick={openLink} 
                                className="w-full bg-[#4060C1] text-white font-semibold py-3 px-5 rounded-lg hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center gap-3 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-1"
                                disabled={!displayProject.git_repo}
                            >
                                <IoLogoYoutube size={'25'} />
                                <span>Demo Link</span>
                            </button>
                        </section>

                        <section className="bg-white p-6 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Features</h2>
                            {dfeatures.map((feature,index)=>{
                                    return <b className='flex flex-row gap-1'><FaLocationArrow  size={'20'}/> feature</b>
                            })}
                           
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
}