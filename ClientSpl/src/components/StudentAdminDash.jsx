
import React from 'react';

// --- SVG Icon Component ---
const UserCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="10" r="3" />
        <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
);


const ProgressRing = ({ percentage }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
        
            <circle
                stroke="#E9F0FF"
                strokeWidth="12"
                fill="transparent"
                r={radius}
                cx="60"
                cy="60"
            />
           
            <circle
                className="transition-all duration-500 ease-out"
                stroke="#4060C1"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx="60"
                cy="60"
            />
        </svg>
    );
};


const StudentResultCard = ({ studentData }) => {
    const { student_username, student_name, total_marks, average_marks } = studentData;
    
  
    const averagePercentage = (average_marks / 10) * 100;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/80 p-6 w-full max-w-sm hover:shadow-xl transition-shadow duration-300">

            <div className="flex items-center gap-4 border-b border-slate-200">
                <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserCircleIcon />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{student_name}</h2>
                    <p className="text-sm text-slate-500 font-medium">@{student_username}</p>
                </div>
            </div>

            
            <div className="flex items-center justify-around text-center py-4">
                
                <div>
                    <p className="text-sm font-semibold text-slate-500">Total Marks</p>
                    <p className="text-4xl font-extrabold text-[#4060C1]">{total_marks}</p>
                </div>
                
                {/* Visual Separator */}
                <div className="h-16 w-px bg-slate-200"></div>

                {/* Average Marks Section */}
                <div>
                    <p className="text-sm font-semibold text-slate-500">Average</p>
                    <p className="text-4xl font-extrabold text-[#4060C1]">{average_marks.toFixed(1)}</p>
                    <p className="text-xs text-slate-400">out of 10</p>
                </div>
            </div>
            
            {/* Visual Progress Indicator */}
            <div className="relative flex justify-center items-center mt-4">
                <ProgressRing percentage={averagePercentage} />
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-700">{Math.round(averagePercentage)}%</span>
                    <span className="text-xs text-slate-500">Avg. Score</span>
                </div>
            </div>
        </div>
    );
};



export default function App({student}) {
    const studentData = student

    return (
        <div className=" bg-[#E9F0FF] flex  p-4 font-sans">
            <StudentResultCard studentData={studentData} />
        </div>
    );
}
