import React, { useEffect, useState } from 'react';
import Changepassword from './Changepassword';
import { userContext } from '../hooks/AutoAuth';
import axios from 'axios';

const InputField = ({ label, placeholder, type = 'text', value = '', onChange }) => (
    <div>
        <label className="block text-base font-medium text-gray-800 mb-2">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="bg-white w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
        />
    </div>
);


const SelectField = ({ label, options, value, onChange }) => (
    <div>
        <label className="block text-base font-medium text-gray-800 mb-2">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base bg-white appearance-none"
        >
            <option value="" disabled>Select your institution</option>
            {options.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);


const SettingsPage = () => {
    const { User, setUser, loading, uploadDetails } = userContext();
  useEffect(() => {
  if (User && User?.user) {
    console.log(User.user)
    setInstitution(User.user?.institution || '');
    setImage(
      User?.user?.image ||
      `https://placehold.co/96x96/E2E8F0/4A5568?text=${User?.user?.full_name[0].toUpperCase()}${User?.user?.full_name[1].toUpperCase()}`
    );
    setBios(User?.user?.bio || '');
    setGithub(User?.user?.github_link || '');
  }
}, [User]);

    const institutions = [
        "University of Dhaka",
        "Bangladesh University of Engineering and Technology (BUET)",
        "Islamic University of Technology (IUT)",
        "University of Rajshahi",
        "University of Chittagong",
        "Jahangirnagar University",
        "Khulna University",
        "Khulna University of Engineering & Technology (KUET)",
        "Rajshahi University of Engineering & Technology (RUET)",
        "Chittagong University of Engineering & Technology (CUET)",
        "North South University (NSU)",
        "BRAC University",
        "Independent University, Bangladesh (IUB)",
        "Ahsanullah University of Science and Technology (AUST)",
        "United International University (UIU)",
        "East West University (EWU)",
        "American International University-Bangladesh (AIUB)",
        "Daffodil International University (DIU)",
        "Bangladesh University of Business and Technology (BUBT)",
        "Premier University, Chittagong",
        "University of Liberal Arts Bangladesh (ULAB)",
        "Southeast University",
        "Daffodil International University",
        "University of Asia Pacific (UAP)",
        "Bangladesh University of Professionals (BUP)"
    ];





    const [institution, setInstitution] = useState(User?.user?.institution || '');
    console.log(User?.user?.image)
    const [image, setImage] = useState(User?.user?.image ? User?.user?.image : `https://placehold.co/96x96/E2E8F0/4A5568?text=${User?.user?.full_name[0].toUpperCase() + User?.user?.full_name[1].toUpperCase()}`);
    const [settings, setsettings] = useState(true)
    const [bios, setBios] = useState(User?.bios ? User.bios : '');
    const [github, setGithub] = useState(User?.github ? User.github : '');
    if (loading == true) {
        return <div>The data is not loaded yet</div>
    }
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await axios.post(
                `https://api.imgbb.com/1/upload?key=65c82bf88920ece9ea8497799d93312f`,
                formData,
                {
                    headers: {

                    },
                }
            );

            const imageUrl = res.data.data.url;

            setImage(imageUrl);
            console.log("Image URL:", imageUrl);
        } catch (error) {
            console.error("Upload failed:", error);
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        uploadDetails(image, institution, bios, github);
        const token =localStorage.getItem('token')
        const sendupdate =async ()=>{
            User.user.github_link = github;
            User.user.institution=institution;
            User.user.bio=bios;
            User.user.image = image;
           const res = await axios.put('http://localhost:4000/api/auth/profile', User.user,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
        }
        sendupdate()
        console.log(image)
        console.log(institution)
        console.log(bios)
        console.log(github)
        return;
    }

    const handleInstitutionChange = (e) => {
        setInstitution(e.target.value);
    };
    return (
        <div className="bg-[#E9F0FF] min-h-screen font-sans">
            <header className="bg-[#6D8EF2] w-full py-8 xl:py-10 2xl:py-12">
                <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">Edit your settings</h1>
                </div>
            </header>

            <main className="w-full max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 xl:gap-24">

                    <aside className="w-full lg:w-2/5 xl:w-1/3 ">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">Portfolio</h2>
                        <nav className="flex flex-col gap-2">
                            <a onClick={() => { setsettings(true) }} href="#" className="block text-base py-2.5 rounded-r-md hover:bg-gray-100 hover:text-gray-900 text-gray-500 px-3 ">Profile info</a>
                            <a href="#" className="block text-base py-2.5 rounded-md transition-colors duration-200 text-gray-500 hover:text-gray-900 border-l-4 border-transparent hover:bg-gray-50 px-3">Hackathon Recommendations</a>
                            <a href="#" className="block text-base py-2.5 rounded-md transition-colors duration-200 text-gray-500 hover:text-gray-900 border-l-4 border-transparent hover:bg-gray-50 px-3">Preferences & Eligibility</a>
                        </nav>

                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-10 mb-4 px-3">Account Management</h2>
                        <nav className="flex flex-col gap-2">
                            <a href="#" className="block text-base py-2.5 rounded-md transition-colors duration-200 text-gray-500 hover:text-gray-900 border-l-4 border-transparent hover:bg-gray-50 px-3">Email notifications</a>
                            <a href="#" className="block text-base py-2.5 rounded-md transition-colors duration-200 text-gray-500 hover:text-gray-900 border-l-4 border-transparent hover:bg-gray-50 px-3">Account & privacy</a>
                            <a onClick={() => { setsettings(false) }} href="#" className="block text-base py-2.5 rounded-md transition-colors duration-200 text-gray-500 hover:text-gray-900 border-l-4 border-transparent hover:bg-gray-50 px-3">Password</a>
                        </nav>
                    </aside>
                    {settings ? (
                        <section className="w-full lg:w-3/5 xl:w-2/3">
                            <form onSubmit={handleSubmit} className="max-w-4xl">
                                <h2 className="text-4xl xl:text-5xl font-bold text-gray-900">Profile info</h2>
                                <p className="text-lg text-gray-600 mt-2">This information will appear on your public profile.</p>

                                <hr className="my-8 border-gray-200" />

                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                        <img src={image} className="w-full h-full object-cover" />
                                    </div>
                                    <label className="cursor-pointer  hover:text-blue-600 text-blue-400 px-4 py-2 rounded inline-block">
                                        Upload Photo
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <InputField label="Fullname" value={User?.user?.full_name} />
                                    <InputField label="Email" value={User?.user?.email} />
                                </div>




                                <div className="mt-8">
                                    <label className="block text-base font-medium text-gray-800 mb-2">Bio</label>
                                    <textarea
                                        onChange={(e) => { setBios(e.target.value) }}
                                        value={bios}
                                        rows="4"
                                        className="resize-none w-full px-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
                                    ></textarea>
                                </div>

                                <div className="mt-16">
                                    <h3 className="text-3xl xl:text-4xl font-bold text-gray-900">Social</h3>
                                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <InputField label="GitHub"
                                            onChange={(e) => { setGithub(e.target.value) }}
                                            value={github}
                                            placeholder="@" />
                                        <div className="mt-0">
                                            <SelectField

                                                label="Institution"
                                                options={institutions}
                                                value={institution} 
                                                onChange={handleInstitutionChange}
                                            />
                                        </div>

                                    </div>
                                </div>

                                <div className="mt-12 flex items-center gap-4">
                                    <button type="submit" className="bg-[#4060C1] text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg">
                                        Save changes
                                    </button>
                                    <button type="button" className="bg-gray-200 text-gray-800 font-semibold py-3 px-8 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-lg">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </section>
                    ) : (
                        <Changepassword />
                    )
                    }
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
