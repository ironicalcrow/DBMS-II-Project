import React, { useState } from 'react';

const InputField = ({ label, placeholder, type = 'text', value ,setpass }) => {
    
    console.log(value)
    return( <div className="mb-6">
        <label className="block text-base font-medium text-gray-800 mb-2">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            defaultValue={value}
            onChange={(e)=>{setpass(e.target.value)}}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base bg-white outline-none"
        />
    </div>)
};

const ChangePasswordForm = () => {
    const [oldpassword,setoldpassword] = useState('');
     const [newpassword,setnewpassword] = useState('');
     const [confirmpass,setconfirmpass] = useState('');
    return (
        <div className="bg-[#E9F0FF] min-h-screen font-sans p-4 sm:p-6 lg:p-8 flex justify-center">
            <div className="w-full max-w-2xl">
                <h2 className="text-4xl xl:text-5xl font-bold text-gray-900">Change your password</h2>
                <p className="text-lg text-gray-600 mt-2">Passwords must be 8+ characters.</p>

                <hr className="my-8 border-gray-200"/>

                <h3 className="text-2xl font-bold text-gray-800 mb-6">Create a new password</h3>
                
                <form onSubmit={(e)=>{e.preventDefault();console.log(oldpassword,newpassword)}}>
                    <InputField label="Old Password" type="text" value={oldpassword}  setpass={setoldpassword}/>
                    <InputField label="New Password" type="text"  value={newpassword} setpass={setnewpassword} />
                    <InputField label="Confirm" value={confirmpass} setpass={setconfirmpass} type="password" />

                    <div className="mt-8 flex items-center gap-4">
                        <button type="submit" className="bg-[#4060C1] text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg">
                            Save changes
                        </button>
                        <button type="button" className="bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-lg">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const App = () => {
    return <ChangePasswordForm />;
}

export default App;
