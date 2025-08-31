import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';


const PblContext = createContext();


export const usePbls = () => useContext(PblContext);


export const PblProvider = ({ children }) => {
  const [pbls, setPbls] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    axios.get('http://localhost:4000/api/pbl/all-pbls')
      .then(res => {
       
        console.log('Fetched PBLs:', res.data.data);
        setPbls(res.data.data.pbls);
      })
      .catch(err => {
        console.error("Failed to fetch PBLs:", err);
   
        setPbls([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  const refreshPbls = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:4000/api/pbl/all-pbls');
     
      setPbls(res.data.data.pbls);
    } catch (err) {
      console.error("Failed to refresh PBLs:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <PblContext.Provider value={{ pbls, loading, refreshPbls }}>
      {children}
    </PblContext.Provider>
  );
};
