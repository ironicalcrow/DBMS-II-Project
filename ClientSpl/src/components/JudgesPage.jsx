import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, User, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';


const JudgesPage = () => {
    const navigateto = useNavigate();
    const [judges,setjudges]=  useState([])
    const [loader,setloader] = useState(false)
    const location = useLocation()
    const {ID} = location.state;
    console.log(ID)
    
    useEffect(()=>{
        const getjudges = async()=>{
            setloader(true)
            console.log(ID)
            const response = 
            await axios.get(`http://localhost:4000/api/hackathon/judges/${ID}`)
            setloader(false)
            setjudges(response.data.data.judges)
        }
        getjudges()
    },[])
    if(loader===true){
        return <div>Please Wait</div>
    }

    return (
        <div className="bg-[#E9F0FF] min-h-screen font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <button 
                        onClick={() => navigate('/')} 
                        className="flex items-center text-black hover:text-gray-900 transition-colors mb-4"
                    >
                        <ChevronLeft className="h-5 w-5 mr-2" />
                        Back to Hackathon
                    </button>
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Meet the Judges</h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Our panel of experts who will be evaluating the projects.
                    </p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {judges.map((judge) => (
                        <div key={judge.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
                            <div className="h-48 bg-gray-200 flex items-center justify-center">
                                <img src={`https://placehold.co/400x650/6D8EFB/FFFFFF?text=${judge.username.slice(0,2).toUpperCase()}`} alt={'d'} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-6 text-center">
                                <h2 className="text-xl font-bold text-gray-800">{judge.full_name}</h2>
                                <p className="text-gray-600 mt-1">{judge.username}</p>
                               
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default JudgesPage;
