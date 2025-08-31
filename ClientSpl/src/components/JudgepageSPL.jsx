import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const JudgePage = () => {
    const [view, setView] = useState('main'); 
    const navigateto= useNavigate()
    const location = useLocation();
    
    const { spldata } = location?.state || {};
    console.log(spldata)
  
    const getLocalDateString = (dateInput) => {
      
        const date = dateInput ? new Date(dateInput) : new Date();
        const year = date.getFullYear();
     
        const month = String(date.getMonth() + 1).padStart(2, '0');
 
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = getLocalDateString();

    const renderContent = () => {
        
        switch (view) {
            case 'proposal':
                return (
                    <div className="text-center animate-fade-in">
                        <h2 className="text-2xl font-bold" style={{ color: '#4060C1' }}>Proposal Submissions</h2>
                        <p className="text-gray-600 mt-2">Reviewing all team proposals.</p>
                    </div>
                );
            case 'progress':
                return (
                    <div className="text-center animate-fade-in">
                        <h2 className="text-2xl font-bold" style={{ color: '#4060C1' }}>Progress Submissions</h2>
                        <p className="text-gray-600 mt-2">Checking mid-point progress reports.</p>
                    </div>
                );
            case 'final':
                return (
                    <div className="text-center animate-fade-in">
                        <h2 className="text-2xl font-bold" style={{ color: '#4060C1' }}>Final Presentations</h2>
                        <p className="text-gray-600 mt-2">Evaluating the final project demos.</p>
                    </div>
                );
            default:
                if (!spldata) {
                    return <div className="text-center">Loading schedule...</div>;
                }

             
                const proposalDate = getLocalDateString(spldata.proposal_Date);
                const progressDate = getLocalDateString(spldata.progress_date);
                const finalDate = getLocalDateString(spldata.final_presentation);

                const isProposalDisabled = today !== proposalDate;
                const isProgressDisabled = today !== progressDate;
                const isFinalDisabled = today !== finalDate;

                return (
                    <div className="text-center animate-fade-in">
                        <h1 className="text-3xl font-bold" style={{ color: '#4060C1' }}>Judge Dashboard</h1>
                        <p className="text-gray-600 mt-2 mb-8">Select a category to view submissions.</p>
                        <div className="space-y-4">
                            <button 
                                onClick={() => navigateto('/newevaluatorpage',{state:{spldata,type:1}})} 
                                disabled={isProposalDisabled}
                                className={`w-full font-semibold py-3 px-4 rounded-lg text-white transition-all duration-300 ${isProposalDisabled ? 'bg-gray-400 opacity-50 cursor-not-allowed' : 'transform hover:scale-105 hover:brightness-90'}`}
                                style={{ backgroundColor: isProposalDisabled ? '' : '#4060C1' }}>
                                View Proposals
                            </button>
                            <button 
                                onClick={() => navigateto('/newevaluatorpage',{state:{spldata,type:2}})}
                                disabled={isProgressDisabled}
                                className={`w-full font-semibold py-3 px-4 rounded-lg text-white transition-all duration-300 ${isProgressDisabled ? 'bg-gray-400 opacity-50 cursor-not-allowed' : 'transform hover:scale-105 hover:brightness-90'}`}
                                style={{ backgroundColor: isProgressDisabled ? '' : '#4060C1' }}>
                                View Progress
                            </button>
                            <button 
                                onClick={() => navigateto('/newevaluatorpage',{state:{spldata,type:3}})}
                                disabled={isFinalDisabled}
                                className={`w-full font-semibold py-3 px-4 rounded-lg text-white transition-all duration-300 ${isFinalDisabled ? 'bg-gray-400 opacity-50 cursor-not-allowed' : 'transform hover:scale-105 hover:brightness-90'}`}
                                style={{ backgroundColor: isFinalDisabled ? '' : '#4060C1' }}>
                                View Finals
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-6">
                            Note: Buttons are only enabled on their scheduled presentation day. 
                            Today is {today}.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
            {view !== 'main' && (
                <button 
                    onClick={() => setView('main')} 
                    className="mb-6 text-sm font-semibold hover:underline" 
                    style={{ color: '#4060C1' }}>
                    &larr; Back to Dashboard
                </button>
            )}
            {renderContent()}
        </div>
    );
};

export default function App() {
    const customStyles = `
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
    `;
    
    return (
        <div className="text-gray-800 flex items-center justify-center min-h-screen p-4 font-sans" style={{ backgroundColor: '#E9F0FF' }}>
            <style>{customStyles}</style>
            <JudgePage />
        </div>
    );
}