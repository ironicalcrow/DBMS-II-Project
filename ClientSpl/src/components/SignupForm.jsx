import axios from 'axios';
import React, { useState } from 'react';
import { userContext } from '../hooks/AutoAuth';

import { FaArrowRightLong, FaEye, FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';

const validateDate = (date) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (date >= todayStr) {
        return 'Date is invalid';
    }
    return true;
}
const validatepassword = (password, confirmPassword) => {
    if (password === confirmPassword) {
        return true;
    }
    return 'Password does not match';
}
const App = () => {
    const [color,setcolor] = useState('bg-red-600')
    const { User, setUser } = userContext();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [secondarypass, setsecondarypass] = useState('');
    const navigateto = useNavigate()
    const [formData, setformData] = useState({
        username: '',
        email: '',
        full_name: '',
        date_of_birth: '',
        password: ''
    });
    const handlechange = (e) => {
        e.preventDefault()
        const { name, value } = e.target;
        setformData((prev) => ({
            ...prev,
            [name]: value,

        }))
    }

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const check1 = validateDate(formData.date_of_birth);
        const check2 = validatepassword(formData.password,secondarypass);
        if (check1==true && check2==true){

            try {
                const response = await axios.post(
                    'http://localhost:4000/api/auth/register',
                    formData,
                    {
                        withCredentials: true,
                    }
                );

                console.log(response.data);
                console.log(response.data.user);
                console.log(response.data.data?.user);

                if (response.data?.data?.user != null) {
                    const user = response.data.data.user;
                    const token = response.data.data.token;

                    console.log(user);
                    setUser(user);

                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('token', token);

                    navigateto('/');
                }
            } catch (error) {
                console.error("Registration failed:", error);
            }
        }
        else{
            console.log(check1,check2)
            if(check1==='Date is invalid'){
                alert('Date is invalid')
            }
            else{
                alert('password does not match')
            }
            return ;
        }    
    };



    const EyeIcon = ({ visible, onClick }) => (
        <button type="button" onClick={onClick} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {visible ? <FaEye size={15} /> : <FaEyeSlash size={15} />}
        </button>
    );

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#E9F0FF] font-sans">
            <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0 md:m-0">

                <div className="p-6 md:p-12">
                    <h2 className="font-bold text-3xl mb-4">Create an Account</h2>
                    <p className="max-w-sm mb-8 font-light text-gray-600 text-sm">
                        Get started by creating your account. It's fast and easy.
                    </p>


                    <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
                        <input
                            required
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handlechange}
                            className="w-full p-3 border border-gray-300 rounded-md placeholder:font-light text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="Full Name"
                        />
                        <input
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handlechange}
                            className="w-full p-3 border border-gray-300 rounded-md placeholder:font-light text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="Email Address"
                        />
                        <input
                            required
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handlechange}
                            className="w-full p-3 border border-gray-300 rounded-md placeholder:font-light text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="Username"
                        />
                        <div className="relative">
                            <input
                                required
                                type="date"
                                name="date_of_birth"

                                value={formData.date_of_birth}
                                onChange={handlechange}
                                className="w-full p-3 border border-gray-300 rounded-md placeholder:font-light text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="Date of Birth"

                                onFocus={(e) => (e.target.type = 'date')}
                                onBlur={(e) => (e.target.type = 'text')}
                            />
                        </div>

                        <div className="relative">
                            <input
                                required
                                type={passwordVisible ? "text" : "password"}
                                name="password"
                                e="full_name"
                                value={formData.password}
                                onChange={handlechange}
                                className="w-full p-3 border border-gray-300 rounded-md placeholder:font-light text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="Password"
                            />
                            <EyeIcon visible={passwordVisible} onClick={togglePasswordVisibility} />
                        </div>
                        <div className="relative">
                            <input
                                required
                                type={confirmPasswordVisible ? "text" : "password"}
                                value={secondarypass}
                                onChange={(e) => { (setsecondarypass(e.target.value)) }}
                                name="confirmPassword"
                                className="w-full p-3 border border-gray-300 rounded-md placeholder:font-light text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="Confirm Password"
                            />
                            <EyeIcon visible={confirmPasswordVisible} onClick={toggleConfirmPasswordVisibility} />
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-4 flex justify-center items-center p-3 space-x-2 font-bold text-white rounded-md bg-[#4060C1] shadow-lg hover:bg-blue-700 transition duration-150 ease-in-out transform hover:scale-105"
                        >
                            <span>Sign Up</span>
                            <FaArrowRightLong color='white' size={15} />
                        </button>
                    </form>


                    <div className="mt-8 border-b border-b-gray-300"></div>

                    <p className="py-4 text-sm font-light text-center text-gray-400">
                        Already have an account? <a href="#" className="font-bold text-blue-400 hover:underline">Log in</a>
                    </p>
                </div>


                <div className="relative">
                    <img
                        src="https://placehold.co/400x650/6D8EFB/FFFFFF?text=Welcome"
                        alt="Decorative visual for the sign-up form"
                        className="w-[400px] h-full hidden rounded-r-2xl md:block object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x650/cccccc/ffffff?text=Image+Not+Found'; }}
                    />
                </div>
            </div>
        </div>
    );
};

export default App;
