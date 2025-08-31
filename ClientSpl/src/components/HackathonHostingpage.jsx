import React, { useState, useMemo } from 'react';
import {
    User, PartyPopper, Shapes, Calendar, Clock, Link, Image as ImageIcon,
    CheckCircle, ArrowRight, ArrowLeft, ChevronDown, Users, Trash2, Trophy
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Global Styles & Helper Components (No changes needed) ---
const GlobalStyles = () => (
    <style>{`
      body {
        font-family: 'Inter', sans-serif;
        background-color: #E9F0FF;
        color: #1f2937;
      }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .form-step-enter { animation: fadeIn 0.5s ease-out forwards; }
      input[type="date"]::-webkit-calendar-picker-indicator {
         filter: invert(0.6);
      }
      .hidden-file-input {
        width: 0.1px; height: 0.1px; opacity: 0; overflow: hidden; position: absolute; z-index: -1;
      }
    `}</style>
);

const FormInput = ({ id, name, type, placeholder, value, onChange, icon, error }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            {icon}
        </div>
        <input
            id={id} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange}
            className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-200'} text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300`}
        />
        {error && <p className="text-red-500 text-xs mt-1 pl-1">{error}</p>}
    </div>
);

const FormSelect = ({ id, name, value, onChange, icon, error, children }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            {icon}
        </div>
        <select
            id={id} name={name} value={value} onChange={onChange}
            className={`w-full pl-12 pr-10 py-3.5 rounded-xl bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-200'} text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 appearance-none`}
        >
            {children}
        </select>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
            <ChevronDown size={20} />
        </div>
        {error && <p className="text-red-500 text-xs mt-1 pl-1">{error}</p>}
    </div>
);


export default function App() {
  const hackathonGenres = [
  'AI / ML',
  'Web Development',
  'Mobile Development',
  'Web3 / Blockchain',
  'Game Development',
  'AR / VR / XR',
  'IoT',
  'Cybersecurity',
  'Cloud / DevOps',
  'HealthTech',
  'FinTech',
  'EdTech',
  'Sustainability',
  'Smart Cities',
  'GovTech',
  'Beginner-Friendly',
  'University',
  'High School',
  'Women in Tech'
];
    const navigateto = useNavigate();
    const [step, setStep] = useState(1);
    const [disable,setdisable] = useState(false)
    const [formData, setFormData] = useState({
        hackathon_name: '', host_username: '', duration: '', genre: '', rule_book: '',
        starting_date: '', ending_date: '',
        judges: [{ username: '' }],
        judging_criteria: [{ criteriainfo: '' }],
    });
    const [hackathon_image, setHackathonImage] = useState(null);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleJudgeChange = (index, e) => {
        const { name, value } = e.target;
        const newJudges = [...formData.judges];
        newJudges[index][name] = value;
        setFormData(prev => ({ ...prev, judges: newJudges }));
    };
    const addJudge = () => setFormData(prev => ({ ...prev, judges: [...prev.judges, { username: '' }] }));
    const removeJudge = (index) => setFormData(prev => ({ ...prev, judges: formData.judges.filter((_, i) => i !== index) }));

    const handleCriteriaChange = (index, e) => {
        const { name, value } = e.target;
        const newCriteria = [...formData.judging_criteria];
        newCriteria[index][name] = value;
        setFormData(prev => ({ ...prev, judging_criteria: newCriteria }));
    };
    const addCriterion = () => setFormData(prev => ({ ...prev, judging_criteria: [...prev.judging_criteria, { criteriainfo: '' }] }));
    const removeCriterion = (index) => setFormData(prev => ({ ...prev, judging_criteria: formData.judging_criteria.filter((_, i) => i !== index) }));

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadFormData = new FormData();
        uploadFormData.append("image", file);
        try {
            setdisable(true)
            const apiKey = '992ad57b66fb81baf8b20d6d1134da97' 
            const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, uploadFormData);
            const imageUrl = response.data.data.url;
            setHackathonImage(imageUrl);
            setdisable(false)
        } catch (error) {
            setErrors(prev => ({ ...prev, image: "Image upload failed. Please try again." }));
        }
    };

    const validateStep1 = () => { /* ... no changes ... */ 
        const newErrors = {};
        if (!formData.hackathon_name) newErrors.hackathon_name = 'Hackathon name is required.';
        if (!formData.host_username) newErrors.host_username = 'Host username is required.';
        if (!formData.genre) newErrors.genre = 'Please select a genre.';
        return newErrors;
    };
    const validateStep2 = () => { /* ... no changes ... */ 
        const newErrors = {};
        if (!formData.starting_date) newErrors.starting_date = 'Start date is required.';
        if (!formData.ending_date) newErrors.ending_date = 'End date is required.';
        else if (formData.starting_date && new Date(formData.ending_date) < new Date(formData.starting_date)) {
            newErrors.ending_date = 'End date cannot be before the start date.';
        }
        if (!formData.duration) newErrors.duration = 'Duration is required (e.g., 48 Hours).';
        if (!formData.rule_book) {
            newErrors.rule_book = 'A link to the rule book is required.';
        } else if (!/^(ftp|http|https):\/\/[^ "]+$/.test(formData.rule_book)) {
            newErrors.rule_book = 'Please enter a valid URL.';
        }
        return newErrors;
    };
    const validateStep3 = () => { /* ... no changes ... */ 
        const newErrors = { judging_criteria: [] };
        let hasError = false;
        formData.judging_criteria.forEach((criterion, index) => {
            const criterionError = {};
            if (!criterion.criteriainfo.trim()) {
                criterionError.criteriainfo = "Criterion info is required.";
                hasError = true;
            }
            newErrors.judging_criteria[index] = criterionError;
        });
        return hasError ? newErrors : {};
    };
    const validateStep4 = () => { /* ... no changes ... */
        const newErrors = { judges: [] };
        let hasError = false;
        const hostUsername = formData.host_username.trim().toLowerCase();

        formData.judges.forEach((judge, index) => {
            const judgeError = {};
            const judgeUsername = judge.username.trim();

            if (!judgeUsername) {
                judgeError.username = "Judge's username is required.";
                hasError = true;
            } else if (judgeUsername.toLowerCase() === hostUsername) {
                judgeError.username = "Judge cannot be the same as the host.";
                hasError = true;
            }
            newErrors.judges[index] = judgeError;
        });
        return hasError ? newErrors : {};
    };

    const nextStep = () => {
        let newErrors = {};
        if (step === 1) newErrors = validateStep1();
        if (step === 2) newErrors = validateStep2();
        if (step === 3) newErrors = validateStep3();
        if (step === 4) newErrors = validateStep4();
        setErrors(newErrors);
        const isValid = Object.keys(newErrors).length === 0 ||
            (newErrors.judges && newErrors.judges.every(e => Object.keys(e).length === 0)) ||
            (newErrors.judging_criteria && newErrors.judging_criteria.every(e => Object.keys(e).length === 0));
        if (isValid) setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const judgeUsernames = formData.judges.map(j => j.username.trim()).filter(Boolean).join(', ');
        const submissionData = { ...formData, judge_username: judgeUsernames, hackathon_image };
        try {
            const token = localStorage.getItem('token') || 'mock-token';
            const response = await axios.post('http://localhost:4000/api/hackathon/host', submissionData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const hackathon_id = response.data.data.hackathon_id;
            const finalData = { ...submissionData, hackathon_id };
            setStep(s => s + 1);
            setTimeout(() => {
                navigateto('/viewhackathon', { state: { finalData, User: 'Host' } });
            }, 2000);
        } catch (error) {
            console.error("API submission failed:", error);
        }
    };

    const steps = ['Core Details', 'Schedule & Rules', 'Judging Criteria', 'Add Judges', 'Review & Submit'];

    // --- NEW: Vertical Step Indicator Component ---
    const StepIndicator = useMemo(() => (
        <div className="w-full h-full bg-gradient-to-br from-[#6D8EF2] to-[#4060C1] p-8 rounded-l-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Hackathon Setup</h2>
            <p className="text-indigo-200 text-sm mb-10">Follow the steps to launch your event.</p>
            <nav>
                <ul className="space-y-4">
                    {steps.map((label, index) => {
                        const stepNumber = index + 1;
                        const isActive = step === stepNumber;
                        const isCompleted = step > stepNumber;
                        return (
                            <li key={index} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 transition-all duration-300 ${isActive ? 'bg-white text-[#4060C1]' : isCompleted ? 'bg-green-500 text-white' : 'bg-indigo-400/50 text-white'}`}>
                                    {isCompleted ? <CheckCircle size={16} /> : stepNumber}
                                </div>
                                <span className={`font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-indigo-200'}`}>{label}</span>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    ), [step]);

    // --- NEW: Review Step Detail Component ---
    const ReviewDetail = ({ label, value }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-gray-800 font-medium break-all">{String(value) || 'N/A'}</span>
        </div>
    );
    
    return (
        <>
            <GlobalStyles />
            <div className="min-h-screen w-full flex items-center justify-center p-4">
                <div className="w-full max-w-6xl mx-auto">
                    <header className="text-center mb-6">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
                            Create a New Hackathon
                        </h1>
                        <p className="mt-2 text-lg text-gray-600">Bring your vision to life, one step at a time.</p>
                    </header>

                    {/* --- NEW: Two-Column Layout --- */}
                    <main className="grid grid-cols-1 lg:grid-cols-3 bg-white rounded-2xl shadow-2xl min-h-[650px]">
                        {/* Left Sidebar */}
                        <div className="hidden lg:block">
                            {StepIndicator}
                        </div>

                        {/* Right Form Panel */}
                        <div className="lg:col-span-2 p-8 sm:p-12 flex flex-col justify-between">
                            <form onSubmit={handleSubmit} noValidate className="flex-grow flex flex-col">
                                <div className="flex-grow">
                                    {step === 1 && (
                                        <section className="form-step-enter">
                                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Core Details</h2>
                                            <p className="text-gray-500 mb-8">Let's start with the basics.</p>
                                            <div className="space-y-6">
                                                <FormInput id="hackathon_name" name="hackathon_name" type="text" placeholder="My Awesome Hackathon" value={formData.hackathon_name} onChange={handleChange} icon={<PartyPopper size={20} />} error={errors.hackathon_name} />
                                                <FormInput id="host_username" name="host_username" type="text" placeholder="your-username" value={formData.host_username} onChange={handleChange} icon={<User size={20} />} error={errors.host_username} />
                                               <FormSelect id="genre" name="genre" value={formData.genre} onChange={handleChange} icon={<Shapes size={20} />} error={errors.genre}>
    <option value="" disabled>Select a genre...</option>
    {hackathonGenres.map(genre => (
        <option key={genre} value={genre}>
            {genre}
        </option>
    ))}
</FormSelect>
                                            </div>
                                        </section>
                                    )}

                                    {step === 2 && (
                                        <section className="form-step-enter">
                                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Schedule & Rules</h2>
                                            <p className="text-gray-500 mb-8">Set the timeline and guidelines.</p>
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <FormInput id="starting_date" name="starting_date" type="date" value={formData.starting_date} onChange={handleChange} icon={<Calendar size={20} />} error={errors.starting_date} />
                                                    <FormInput id="ending_date" name="ending_date" type="date" value={formData.ending_date} onChange={handleChange} icon={<Calendar size={20} />} error={errors.ending_date} />
                                                </div>
                                                <FormInput id="duration" name="duration" type="text" placeholder="e.g., 48 Hours, 3 Days" value={formData.duration} onChange={handleChange} icon={<Clock size={20} />} error={errors.duration} />
                                                <FormInput id="rule_book" name="rule_book" type="url" placeholder="https://link-to-your/rulebook.pdf" value={formData.rule_book} onChange={handleChange} icon={<Link size={20} />} error={errors.rule_book} />
                                            </div>
                                        </section>
                                    )}

                                    {step === 3 && (
                                        <section className="form-step-enter">
                                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Judging Criteria</h2>
                                            <p className="text-gray-500 mb-8">Define how projects will be evaluated.</p>
                                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                                                {formData.judging_criteria.map((criterion, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <div className="flex-grow">
                                                            <FormInput id={`criterion-info-${index}`} name="criteriainfo" type="text" placeholder={`Criterion #${index + 1}`} value={criterion.criteriainfo} onChange={(e) => handleCriteriaChange(index, e)} icon={<CheckCircle size={20} />} error={errors.judging_criteria?.[index]?.criteriainfo} />
                                                        </div>
                                                        {formData.judging_criteria.length > 1 && (
                                                            <button type="button" onClick={() => removeCriterion(index)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                                                <Trash2 size={20} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <button type="button" onClick={addCriterion} className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:text-indigo-500 text-gray-500 font-semibold transition-colors">
                                                <Shapes size={18} /> Add Criterion
                                            </button>
                                        </section>
                                    )}

                                    {step === 4 && (
                                         <section className="form-step-enter">
                                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Add Judges</h2>
                                            <p className="text-gray-500 mb-8">Assign experts to evaluate submissions.</p>
                                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                                                {formData.judges.map((judge, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <div className="flex-grow">
                                                            <FormInput id={`judge-username-${index}`} name="username" type="text" placeholder={`Judge #${index + 1} Username`} value={judge.username} onChange={(e) => handleJudgeChange(index, e)} icon={<User size={20} />} error={errors.judges?.[index]?.username} />
                                                        </div>
                                                        {formData.judges.length > 1 && (
                                                            <button type="button" onClick={() => removeJudge(index)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                                                <Trash2 size={20} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <button type="button" onClick={addJudge} className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:text-indigo-500 text-gray-500 font-semibold transition-colors">
                                                <Users size={18} /> Add Judge
                                            </button>
                                        </section>
                                    )}
                                    
                                    {step === 5 && (
                                        <section className="form-step-enter">
                                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Review & Submit</h2>
                                            <p className="text-gray-500 mb-8">Final check before launching your hackathon.</p>
                                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
                                                {hackathon_image && <img src={hackathon_image} alt="Banner" className="w-full h-48 object-cover rounded-lg" />}
                                                <h3 className="text-2xl font-bold text-gray-800">{formData.hackathon_name}</h3>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                    <ReviewDetail label="Host" value={formData.host_username} />
                                                    <ReviewDetail label="Genre" value={formData.genre} />
                                                    <ReviewDetail label="Duration" value={formData.duration} />
                                                    <ReviewDetail label="Start Date" value={formData.starting_date} />
                                                    <ReviewDetail label="End Date" value={formData.ending_date} />
                                                    <ReviewDetail label="Rulebook" value="Link Provided" />
                                                </div>
                                                <div className="pt-4 border-t border-gray-200">
                                                    <h4 className="text-sm text-gray-500 mb-3">Judging Criteria</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {formData.judging_criteria.map((c, i) => c.criteriainfo && <span key={i} className="bg-indigo-100 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full">{c.criteriainfo}</span>)}
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-gray-200">
                                                    <h4 className="text-sm text-gray-500 mb-3">Judges</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {formData.judges.map((j, i) => j.username && <span key={i} className="bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">{j.username}</span>)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="hackathon-image-upload" className="cursor-pointer flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:text-indigo-500 text-gray-500 font-semibold transition-colors mt-4">
                                                        <ImageIcon size={18} /> {hackathon_image ? 'Change Banner Image' : 'Upload Banner Image'}
                                                    </label>
                                                    <input id="hackathon-image-upload" name="hackathon_image" type="file" className="hidden-file-input" onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" />
                                                    {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    {step === 6 && (
                                        <section className="form-step-enter text-center flex flex-col items-center justify-center h-full">
                                            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                                            <h2 className="text-3xl font-bold text-gray-800">Hackathon Created!</h2>
                                            <p className="text-gray-500 mt-2">Get ready for innovation. Redirecting you now...</p>
                                        </section>
                                    )}
                                </div>
                                
                                {step < 6 && (
                                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                                        {step > 1 ? (
                                            <button type="button" onClick={prevStep} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-colors">
                                                <ArrowLeft size={18} /> Back
                                            </button>
                                        ) : <div />}

                                        {step < steps.length ? (
                                            <button type="button" disabled={disable} onClick={nextStep} className={`flex items-center gap-2 px-6 py-3 rounded-lg bg-[#4060C1] hover:bg-[#3551A6] text-white font-semibold transition-colors shadow-md hover:shadow-lg`}>
                                                Next <ArrowRight size={18} />
                                            </button>
                                        ) : (
                                            <button disabled={disable} type="submit" className={`flex items-center gap-2 px-6 py-3 rounded-lg ${disable===false?'bg-green-600':'bg-gray-200'}  hover:bg-green-700 text-white font-semibold transition-colors shadow-md hover:shadow-lg`}>
                                                Confirm & Launch <Trophy size={18} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}