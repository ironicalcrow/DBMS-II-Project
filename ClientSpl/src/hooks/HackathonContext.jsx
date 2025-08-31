import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const HackathonsContext = createContext();

export const useHackathons = () => useContext(HackathonsContext);

export const HackathonsProvider = ({ children }) => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:4000/api/hackathon/all-hackathons')
      .then(res => {console.log(res.data.data.hackathons);setHackathons(res.data.data.hackathons)})
      .finally(() =>{setLoading(false)});
  }, []);

  const refreshHackathons = async () => {
    const res = await axios.get('http://localhost:4000/api/hackathon/all-hackathons');
    setHackathons(res.data.data);
  };

  return (
    <HackathonsContext.Provider value={{ hackathons, loading, refreshHackathons }}>
      {children}
    </HackathonsContext.Provider>
  );
};
