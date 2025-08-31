import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const ProjectsContext = createContext();


export const useProjects = () => useContext(ProjectsContext);


export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    axios.get('http://localhost:4000/api/project/all-projects')
      .then(res => {
        setProjects(res.data.data.projects);
      })
      .catch(err => {
        console.error("Error fetching projects:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  
  const refreshProjects = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/project/all-projects');
      setProjects(res.data.data.projects);
    } catch (error) {
      console.error("Failed to refresh projects:", error);
    }
  };

  return (
    <ProjectsContext.Provider value={{ projects, loading, refreshProjects }}>
      {children}
    </ProjectsContext.Provider>
  );
};
