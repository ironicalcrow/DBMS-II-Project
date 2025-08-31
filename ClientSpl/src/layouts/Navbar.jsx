import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaAngleDown } from "react-icons/fa";
import { IoMdSearch, IoIosNotifications } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import axios from 'axios';
import Logo from '../Images/logo.png';
import { userContext } from '../hooks/AutoAuth';


const suggestions = [
    { label: 'Explore Hackathons', path: '/hackathons' },
    { label: 'Discover Projects', path: '/projects' },
    { label: 'Your Profile', path: '/profileinfo' },
    { label: 'Account Settings', path: '/settings' },
];



const Navbar = () => {
    const navigateto = useNavigate();
    const [showJoinDropdown, setShowJoinDropdown] = useState(false);
    const [showHostDropdown, setShowHostDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    
    // --- START: NEW CODE FOR PBL DROPDOWN ---
    const [showPblDropdown, setShowPblDropdown] = useState(false);
    // --- END: NEW CODE FOR PBL DROPDOWN ---

    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchContainerRef = useRef(null);
    const searchInputRef = useRef(null);

    // --- START: NEW CODE FOR SUGGESTIONS ---
    const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);
    // --- END: NEW CODE FOR SUGGESTIONS ---

    const joinRef = useRef(null);
    const hostRef = useRef(null);
    const profileRef = useRef(null);

    // --- START: NEW CODE FOR PBL DROPDOWN ---
    const pblRef = useRef(null);
    // --- END: NEW CODE FOR PBL DROPDOWN ---

    const { User, setUser, loading, logout } = userContext();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (joinRef.current && !joinRef.current.contains(event.target)) { setShowJoinDropdown(false); }
            if (hostRef.current && !hostRef.current.contains(event.target)) { setShowHostDropdown(false); }
            if (profileRef.current && !profileRef.current.contains(event.target)) { setShowProfileDropdown(false); }
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) { setIsSearchVisible(false); }
            // --- START: NEW CODE FOR PBL DROPDOWN ---
            if (pblRef.current && !pblRef.current.contains(event.target)) { setShowPblDropdown(false); }
            // --- END: NEW CODE FOR PBL DROPDOWN ---
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, []);

    useEffect(() => {
        if (isSearchVisible) {
            searchInputRef.current?.focus();
        }
    }, [isSearchVisible]);

    // --- START: NEW CODE FOR SUGGESTIONS ---
    // Effect to filter suggestions as the user types
    useEffect(() => {
        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            const filtered = suggestions.filter(s => 
                s.label.toLowerCase().includes(lowercasedQuery)
            );
            setFilteredSuggestions(filtered);
        } else {
            // If the search bar is empty, show all default suggestions
            setFilteredSuggestions(suggestions);
        }
    }, [searchQuery]);
    // --- END: NEW CODE FOR SUGGESTIONS ---

    if (loading) return <div>Data still not reached</div>;

    const Logout = () => {
        logout();
        navigateto('/');
    };

    const checkIfLoggedin = () => {
        if (User) { navigateto('/hostingpage'); } 
        else {
            alert('You need to be logged in first');
            navigateto('/login');
        }
    };

    const handleSearch = (event) => {
        if (event.key === 'Enter' && searchQuery.trim() !== '') {
            navigateto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchVisible(false);
        }
    };

    // --- START: NEW CODE FOR SUGGESTIONS ---
    // Function to handle clicking on a suggestion
    const handleSuggestionClick = (path) => {
        navigateto(path);
        setSearchQuery(''); // Clear the search bar
        setIsSearchVisible(false); // Close the search bar
    };
    // --- END: NEW CODE FOR SUGGESTIONS ---

    return (
        <div className='relative z-50 bg-white w-full h-22 text-md font-medium shadow-lg mb-0.5 flex items-center justify-between'>
            <div className='relative md:w-100 lg:w-140 xl:w-180 2xl:w-220 max-h-full flex md:gap-1 xl:gap-2 flex-col md:flex-row justify-end items-center'>
                <img onClick={() => { navigateto('/') }} className="md:flex max-h-22 cursor-pointer md:pt-4 md:object-cover xl:h-22 xl:w-1/5" src={Logo} alt="Logo" />
                
                {/* Join Hackathon Dropdown */}
                <div ref={joinRef} className='relative text-black flex flex-row items-center justify-center xl:h-full xl:w-1/4'> <a href='#' onClick={(e) => { e.preventDefault(); setShowJoinDropdown(prev => !prev); }} className='flex flex-row items-center lg:whitespace-nowrap justify-center sm:text-sm md:text-sm lg:text-lg xl:text-xl 2xl:text-xl'> Join a Hackathon <FaAngleDown className='hidden lg:block xl:h-full xl:pt-0.5 xl:pl-0.5 xl:ml-1/2' /> </a> {showJoinDropdown && ( <div className="absolute top-full mt-3 w-56 bg-white shadow-lg border rounded-xl flex flex-col z-50 p-2 space-y-1 transition-all duration-150 ease-in-out"> <a onClick={(e) => { e.preventDefault(); setShowJoinDropdown(false); navigateto('/hackathons'); }} href="#" className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-200 hover:text-black transition-all duration-150 text-base"> 🧭 Explore Hackathons </a> <a onClick={(e) => { e.preventDefault(); setShowJoinDropdown(false); navigateto('/projects') }} href="#" className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-200 hover:text-black transition-all duration-150 text-base"> 🔑 Explore Projects </a> </div> )} </div>

                {/* --- START: NEW PBL DROPDOWN --- */}
                <div ref={pblRef} className='relative text-black flex flex-row items-center justify-center xl:h-full xl:w-1/4'> 
                    <a href='#' onClick={(e) => { e.preventDefault(); setShowPblDropdown(prev => !prev); }} className='flex flex-row items-center lg:whitespace-nowrap justify-center sm:text-sm md:text-sm lg:text-lg xl:text-xl 2xl:text-xl'> 
                        Explore PBLs <FaAngleDown className='hidden lg:block xl:h-full xl:pt-0.5 xl:pl-0.5 xl:ml-1/2' /> 
                    </a> 
                    {showPblDropdown && ( 
                        <div className="absolute top-full mt-3 w-56 bg-white shadow-lg border rounded-xl flex flex-col z-50 p-2 space-y-1 transition-all duration-150 ease-in-out"> 
                            <a onClick={(e) => { e.preventDefault(); setShowPblDropdown(false); navigateto('/pbls'); }} href="#" className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-200 hover:text-black transition-all duration-150 text-base"> 📚 Explore PBLs </a> 
                            <a onClick={(e) => { e.preventDefault(); setShowPblDropdown(false); checkIfLoggedin(); navigateto('/my-pbls'); }} href="#" className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-200 hover:text-black transition-all duration-150 text-base"> 📂 My PBLs </a> 
                            <a onClick={(e) => { e.preventDefault(); setShowPblDropdown(false); checkIfLoggedin(); navigateto('/splcreation'); }} href="#" className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-200 hover:text-black transition-all duration-150 text-base"> 📂 Host PBL </a> 
                        </div> 
                    )} 
                </div>
              

                {/* Host Hackathon Dropdown */}
                <div ref={hostRef} className='relative'> <a href="#" onClick={(e) => { e.preventDefault(); setShowHostDropdown(prev => !prev); }} className='flex flex-row items-center justify-center sm:text-sm md:text-sm lg:text-lg xl:text-xl 2xl:text-xl'> Host a Hackathon <FaAngleDown className="hidden lg:block ml-1" /> </a> {showHostDropdown && ( <div className="absolute top-full mt-3 w-56 bg-white shadow-lg border rounded-xl flex flex-col z-50 p-2 space-y-1 transition-all duration-150 ease-in-out"> <a onClick={(e) => { e.preventDefault(); setShowHostDropdown(false); navigateto('/hackathons'); }} href="#" className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-200 hover:text-black transition-all duration-150 text-base"> 🌍 Explore Hackathons </a> <a onClick={(e) => { e.preventDefault(); setShowHostDropdown(false); checkIfLoggedin(); }} className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-200 hover:text-black transition-all duration-150 text-base"> 🚀 Host a Hackathon </a> <a onClick={(e) => { e.preventDefault(); setShowHostDropdown(false); checkIfLoggedin(); navigateto('/profileinfo') }} href="#" className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-200 hover:text-black transition-all duration-150 text-base"> 🗂️ Your Participations </a> </div> )} </div>
            </div>

            {/* Right Side of Navbar - Search, Notifications, Profile/Login */}
            <div className='relative lg:w-70 xl:w-100 2xl:w-180 h-full flex flex-row justify-start items-center'>
                <div ref={searchContainerRef} className="relative flex items-center justify-center">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search or navigate..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        className={`h-10 bg-gray-100 rounded-full pl-10 pr-4 border-2 border-transparent focus:outline-none focus:border-blue-500 transition-all duration-300 ease-in-out ${isSearchVisible ? 'w-64' : 'w-0'}`}
                    />
                    <IoMdSearch
                        onClick={() => setIsSearchVisible(prev => !prev)}
                        className={`absolute left-0 h-11 w-7 lg:h-12 lg:w-8 text-gray-600 cursor-pointer transition-colors hover:text-blue-600 z-10 ${isSearchVisible ? 'left-2' : ''}`}
                    />
                    
                    {/* Suggestions Dropdown */}
                    {isSearchVisible && (
                        <div className="absolute top-full mt-2 w-64 bg-white shadow-lg border rounded-xl flex flex-col z-50 p-2">
                            {filteredSuggestions.length > 0 ? (
                                filteredSuggestions.map((suggestion) => (
                                    <div
                                        key={suggestion.path}
                                        onClick={() => handleSuggestionClick(suggestion.path)}
                                        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 cursor-pointer text-base"
                                    >
                                        <span>{suggestion.label}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-gray-500">No results found.</div>
                            )}
                        </div>
                    )}
                </div>
                {User ? (
                    <div className='w-full md:pr-5 md:gap-3 lg:h-22 lg:max-h-22 lg:gap-5 flex md:flex-row justify-start items-center'>
                        <IoIosNotifications onClick={()=>{navigateto('/notifications')}} className='text-gray-400 hover:text-gray-500 sm:h-1/2 md:h-11 md:w-7 lg:h-15 lg:w-10 object-contain rounded-full' />
                        <div ref={profileRef} className='relative'>
                            {User?.user?.image ? ( <img src={User?.user?.image} onClick={() => setShowProfileDropdown(prev => !prev)} className='h-5 w-5 md:h-7 md:w-7 lg:h-9 lg:w-9 rounded-full cursor-pointer' alt="User" /> ) : ( <CgProfile onClick={() => setShowProfileDropdown(prev => !prev)} className='cursor-pointer md:h-11 md:w-7 lg:h-12 lg:w-8 xl:h-15 xl:w-10 object-cover rounded-full' /> )}
                            {showProfileDropdown && ( <div className="absolute right-0 top-full mt-3 w-56 bg-white shadow-lg border rounded-xl flex flex-col z-50 p-2 space-y-1 transition-all duration-150 ease-in-out"> <a onClick={(e) => { e.preventDefault(); setShowProfileDropdown(false); navigateto('/profileinfo'); }} href="#" className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-200 transition-all duration-150 text-base"> 🧑‍💻 Portfolio </a> <a onClick={(e) => { e.preventDefault(); setShowProfileDropdown(false); navigateto('/settings'); }} href="#" className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-200 transition-all duration-150 text-base"> ⚙️ Settings </a> <a onClick={(e) => { e.preventDefault(); Logout(); }} href="#" className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-blue-200 hover:text-black transition-all duration-150 text-base"> 🔓 Logout </a> </div> )}
                        </div>
                    </div>
                ) : (
                    <div className='gap-6 flex flex-row justify-start items-center text-sm md:text-md lg:text-lg xl:text-xl 2xl:text-2xl'>
                        <button onClick={() => { navigateto('/login'); }} className='hover:text-gray-500 cursor-pointer '>Login</button>
                        <button onClick={() => { navigateto('/signup'); }} className='hover:bg-blue-700 text-white cursor-pointer  rounded-md bg-[#4060C1] py-2 px-2'>Signup</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;