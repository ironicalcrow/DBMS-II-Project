import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import axios from 'axios';

const userData = createContext();
export const userContext = () => useContext(userData);

const AutoAuth = ({ children }) => {
  const [User, setUser] = useState(null);
  const [loading, setloading] = useState(true);
  const [render,setrender] = useState(1)
  useEffect(() => {
     const token = localStorage.getItem('token');
     const user  = JSON.parse(localStorage.getItem('user'))
     
     if(token===null || user===null){
        console.log(user)
     }

    const fetchUserData = async () => {
     

      if (!token) {
        setloading(false);
        return;
      }
        
      try {
        const res = await axios.get('http://localhost:4000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const fullUser = res.data.data;
        setUser(fullUser);
        localStorage.setItem('user', JSON.stringify(fullUser));
      } catch (error) {
        console.error('Error fetching profile data', error);
        setUser(null); // Handle token errors or unauthorized
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setloading(false);
      }
    };

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Set early to prevent null
    }

    fetchUserData(); 
    console.log(loading)// Still fetch latest
  }, [render]);

  const logout = () => {
    setUser(null);
    console.log('done')
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cofiesta_projects');
  };

  const uploadDetails = (url, institution, bios, github) => {
    if (!User) return;

    const updatedUser = {
      ...User,
      image: url,
      institution,
      bio: bios,
      github,
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <userData.Provider value={{ User, setUser, loading, logout, uploadDetails }}>
      {!loading ? children : <div>Loading user...</div>}
    </userData.Provider>
  );
};

export default AutoAuth;
