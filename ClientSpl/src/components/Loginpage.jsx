import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaArrowRightLong } from 'react-icons/fa6';
import { userContext } from '../hooks/AutoAuth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Loginpage = () => {
    const navigateto = useNavigate()
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { User, setUser, loading } = userContext();
    const [formData, setformData] = useState({
        email: '',
        password: ''
    });


    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };
    const handlechange = (e) => {
        e.preventDefault()
        const { name, value } = e.target;
        setformData((prev) => ({
            ...prev,
            [name]: value,

        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response =await axios.post('http://localhost:4000/api/auth/login', formData, {
            withCredentials: true
        });

        console.log(response.data.data.user);
        const user = response.data.data.user;
        const token = response.data.data.token;
        console.log(token)
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        window.location.href = '/';
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#E9F0FF] font-sans">
            <div className="relative flex flex-col m-6 space-y-10 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0 md:m-0">
                <form className="p-6 md:p-20" onSubmit={handleSubmit}>
                    <h2 className="font-bold text-4xl mb-5">Log In</h2>
                    <p className="max-w-sm mb-12 font-light text-gray-600">
                        Log in to your account to continue.
                    </p>

                    <div className="space-y-6">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handlechange}
                            required
                            className="w-full p-4 border border-gray-300 rounded-md placeholder:font-light focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="Email Address"
                        />
                        <div className="relative">
                            <input
                                type={passwordVisible ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handlechange}
                                required
                                className="w-full p-4 border border-gray-300 rounded-md placeholder:font-light focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {passwordVisible ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between mt-6 space-y-6 md:flex-col md:space-y-0">

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-full flex justify-center items-center p-4 space-x-4 font-bold text-white rounded-md bg-[#4060C1] shadow-lg px-9 hover:bg-blue-500 transition duration-150 ease-in-out transform hover:scale-105 disabled:bg-cyan-400 disabled:scale-100"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent border-solid rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Log In</span>
                                    <FaArrowRightLong color='white' size={20} />
                                </>
                            )}
                        </button>
                        <a href="#" className="font-light pt-1 text-md text-black hover:underline">Forgot password?</a>
                    </div>

                    <div className="mt-12 border-b border-b-gray-300"></div>
                    <p className="py-6 text-sm font-light text-center text-gray-400">
                        Don't have an account?{' '}
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigateTo('/signup');
                            }}
                            className="font-bold text-blue-400 hover:underline"
                        >
                            Sign up
                        </a>
                    </p>
                </form>

                <div className="relative">
                    <img
                        src="https://placehold.co/400x650/4060C1/FFFFFF?text=Welcome"
                        alt="Decorative visual for the login form"
                        className="w-[400px] h-full hidden rounded-r-2xl md:block object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/400x650/cccccc/ffffff?text=Image+Not+Found';
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Loginpage;
