import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaLongArrowAltRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const Loginpage = () => {
    const navigateto = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };
    const GoogleSignin=()=>{

    }
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#E9F0FF] font-sans">
            <div className="relative flex flex-col m-6 space-y-10 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0 md:m-0">
                <div className="p-6 md:p-20">
                    <h3 className="font-bold text-3xl mb-5">Sign-in options</h3>
                    <p className="max-w-sm mb-12 font-medium text-gray-600">
                        Log in to your account to continue.
                    </p>
                    <div className="space-y-8">
                     
                       
                    </div>

                    <div className="flex flex-col items-center justify-between mt-6 space-y-6 md:flex-col md:space-y-0 gap-2">
                       
                        <button className="w-full md:w-auto flex justify-center items-center p-4 space-x-4 font-bold text-white rounded-md bg-[#4060C1] shadow-lg px-9 hover:bg-blue-500 transition duration-150">
                            <span onClick={()=>{navigateto('/signupform')}} className="flex flex-row items-center gap-4">Sign with credentials
                                <FaLongArrowAltRight size={'20'}/>
                            </span>
                      
                        </button>
                          <button onClick={GoogleSignin} className="w-full md:w-auto flex justify-center items-center p-4 space-x-4 font-bold text-white rounded-md bg-[#4060C1] shadow-lg px-13 hover:bg-blue-500 transition duration-150">
                            <span className="flex flex-row items-center gap-4">Sign with Google
                                <FaLongArrowAltRight size={'20'}/>
                            </span>
                      
                        </button>
                          <button className="w-full md:w-auto flex justify-center items-center p-4 space-x-4 font-bold text-white rounded-md bg-[#4060C1] shadow-lg px-13 hover:bg-blue-500 transition duration-150">
                            <span className="flex flex-row items-center gap-4">Sign with Github
                                <FaLongArrowAltRight size={'20'}/>
                            </span>
                      
                        </button>
                           <button className="w-full md:w-auto flex justify-center items-center p-4 space-x-4 font-bold text-white rounded-md bg-[#4060C1] shadow-lg px-11 hover:bg-blue-500 transition duration-150">
                            <span className="flex flex-row items-center gap-4">Sign with Facebook
                                <FaLongArrowAltRight size={'20'}/>
                            </span>
                      
                        </button>

                    </div>

                </div>
                <div className="relative">
                    <img
                        src="https://placehold.co/600x800/4060C1/FFFFFF?text=Welcome"
                        alt="img"
                        className="w-[400px] h-full hidden rounded-r-2xl md:block object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

export default Loginpage;
