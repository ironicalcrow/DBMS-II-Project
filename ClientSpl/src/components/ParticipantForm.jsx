import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { userContext } from '../hooks/AutoAuth';
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d={path} />
    </svg>
);

const PlusIcon = () => (
    <Icon path="M12 5v14m-7-7h14" />
);

const TrashIcon = () => (
    <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
);

const UserIcon = () => (
    <Icon path="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
);

const TeamIcon = () => (
    <Icon path="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zM12.78 2.03a1 1 0 00-1.56 0l-4 5a1 1 0 00.78 1.63h8a1 1 0 00.78-1.63l-4-5z" />
);

const InfoIcon = () => (
    <Icon path="M13 16h-2v-6h2v6zm-1-10a1 1 0 100-2 1 1 0 000 2zM12 2a10 10 0 100 20 10 10 0 000-20z" />
);


function App() {
    const navigateto =useNavigate()
    const location = useLocation();
    const { hackathon_id } = location?.state || '';
    console.log(hackathon_id)
    const [teamName, setTeamName] = useState('');
    const [teamInfo, setTeamInfo] = useState('');
    // State for the list of participants
    const [participants, setParticipants] = useState(['']);
    // State to hold the submitted data
    const [submittedData, setSubmittedData] = useState(null);
    const {User,setUser} = userContext();
    console.log(User?.user?.username)
    /**
     * Handles changes to a participant's username input field.
     * @param {number} index - The index of the participant in the array.
     * @param {Event} event - The input change event.
     */
    const handleParticipantChange = (index, event) => {
        const newParticipants = [...participants];
        newParticipants[index] = event.target.value;
        setParticipants(newParticipants);
    };

    /**
     * Adds a new, empty input field for another participant.
     */
    const addParticipant = () => {
        setParticipants([...participants, '']);
    };

    /**
     * Removes a participant's input field from the form.
     * @param {number} index - The index of the participant to remove.
     */
    const removeParticipant = (index) => {
        // Prevents removing the last input field
        if (participants.length > 1) {
            const newParticipants = participants.filter((_, i) => i !== index);
            setParticipants(newParticipants);
        }
    };

    /**
    
     * @param {Event} event - The form submission event.
     */
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Filter out any empty participant fields before submission
        setParticipants([...participants,User.user.username]);

        const team_participants = participants.filter(p => p.trim() !== '');
        team_participants.push(User?.user?.username)
        console.log(team_participants)
        const submission = {
            hackathon_id: hackathon_id,
            team_name: teamName,
            team_info: teamInfo,
            team_participants,
        };
        
        setSubmittedData(submission);
        console.log(submission);
        try {
            const token = localStorage.getItem("token");

            const response = await axios.post(
                "http://localhost:4000/api/participation/create",
                submission,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            ); 
            console.log(response.data)
            const User = 'participant'
            navigateto('/viewhackathon',{state:{User}})

        }
        catch (error) {
            alert('There is some error')
        }

    };

    return (
        <div className="bg-[#E9F0FF] min-h-screen flex items-center justify-center font-sans p-4">
            <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Hackathon Registration</h1>
                    <p className="text-gray-500 mt-2">Create your team and add your participants.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Team Name Input */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <TeamIcon />
                        </span>
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Team Name"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                        />
                    </div>

                    <div className="relative">
                        <span className="absolute top-3 left-0 flex items-center pl-3 text-gray-400">
                            <InfoIcon />
                        </span>
                        <textarea
                            value={teamInfo}
                            onChange={(e) => setTeamInfo(e.target.value)}
                            placeholder="Tell us about your team..."
                            required
                            rows="4"
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition resize-none"
                        ></textarea>
                    </div>

                    {/* Dynamic Participant Inputs */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3">Participants</label>
                        <div id="participant-list" className="space-y-4">
                            {participants.map((participant, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <div className="relative flex-grow">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                            <UserIcon />
                                        </span>
                                        <input
                                            type="text"
                                            value={participant}
                                            onChange={(e) => handleParticipantChange(index, e)}
                                            placeholder={`Participant ${index + 1} Username`}
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                                        />
                                    </div>
                                    {participants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeParticipant(index)}
                                            className="p-2 text-red-500 bg-red-100 hover:bg-red-200 rounded-full transition"
                                            aria-label="Remove participant"
                                        >
                                            <TrashIcon />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={addParticipant}
                        className="w-full flex items-center justify-center py-3 px-4 bg-blue-100 text-blue-600 font-semibold rounded-lg hover:bg-blue-200 transition border-2 border-dashed border-blue-200"
                    >
                        <PlusIcon />
                        <span className="ml-2">Add Another Participant</span>
                    </button>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-4 px-6 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105"
                    >
                        Register Team
                    </button>
                </form>

                {/* Display Submitted Data */}
                {submittedData && (
                    <div className="mt-10 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Submission Successful!</h2>

                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
