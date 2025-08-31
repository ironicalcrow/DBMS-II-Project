import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LandingPage from '../components/Landingpage'
import Signup from '../components/SignupOps'
import Profileinfo from '../components/Profileinfo'
import Settings from '../components/Settings'
import Changepassword from '../components/Changepassword'
import Hackathons from '../components/Hackathons'
import Loginpage from '../components/Loginpage'
import Projects from '../components/Projects'
import SignupForm from '../components/SignupForm'
import Addproject from '../components/Addproject'
import Viewproject from '../components/Viewproject'
import HackathonHostingpage from '../components/HackathonHostingpage'
import ViewHackathon from '../components/ViewHackathon'
import Markingpage from '../components/Markingpage'
import { HackathonsProvider } from '../hooks/HackathonContext'
import { ProjectsProvider } from '../hooks/ProjectContext'
import { PblProvider } from '../hooks/PblContext'
import Notification from '../components/Notification'
import JudgesPage from '../components/JudgesPage'
import ParticipantForm from '../components/ParticipantForm'
import ProjectTeams from '../components/ProjectTeams'
import Projectforhackathon from '../components/Projectforhackathon'
import Newloginpage from '../components2/Newloginpage'
import Newevaluatorpage from '../components2/Newevaluatorpage'
import Newprojectdashboard from '../components2/newprojectDashboard'
import Newspladmingpage from '../components2/Newspladminpage'
import Newstudentpersonal from '../components2/Newstudentpersonal'
import SPLcreation from '../components/SPLcreation'
import Judgepagespl from '../components/JudgepageSPL'
import PBLjoinpass from '../components/PBLjoinpass'
import PBL from '../components/Pbl'
import Supervisordashboard from '../components2/Newsupervisordashboard'
import Links from '../components/Links'
import Updatemarks from '../components/Updatemarks'


const Routing = () => {
  return (
    <div >
      <Routes>
        <Route
          path='/'
          element={
            <HackathonsProvider>
              <LandingPage />
            </HackathonsProvider>
          }
        />
        <Route path='/signup' element={<Signup />}></Route>
        <Route path='/profileinfo' element={<Profileinfo />}></Route>
        <Route path='/settings' element={<Settings />}></Route>
        <Route path='/signupform' element={<SignupForm />}></Route>
        <Route path='/login' element={<Loginpage />}></Route>
        <Route path='/projects' element={<ProjectsProvider><Projects /></ProjectsProvider>}></Route>
        <Route path='/changepassword' element={<Changepassword />}></Route>
        <Route path='/addproject' element={<Addproject />}></Route>
        <Route path='/viewproject' element={<Viewproject />}></Route>
        <Route path='/hostingpage' element={<HackathonHostingpage />}></Route>
        <Route path='/viewhackathon' element={<ViewHackathon />}></Route>
        <Route path='/markingpage' element={<Markingpage />}></Route>
        <Route path='/Notifications' element={<Notification/>}></Route>
        <Route path='/participantform' element={<ParticipantForm/>}></Route>
        <Route path='/projectteams' element={<ProjectTeams/>}></Route>
        <Route path='/projectforhackathon' element={<Projectforhackathon/>}></Route>
        <Route path='/newloginpage' element={<Newloginpage/>}></Route>  
        <Route path='/newevaluatorpage' element={<Newevaluatorpage/>}></Route> 
          <Route path='/newprojectdashboard' element={<Newprojectdashboard/>}></Route>   
        <Route path='/newspladminpage' element={<Newspladmingpage/>}></Route> 
        <Route path='/newstudentpersonal' element={<Newstudentpersonal/>}></Route>
        <Route path='/splcreation' element={<SPLcreation/>}></Route>
        <Route path='/judgepagespl' element={<Judgepagespl/>}></Route>
      <Route path='/pbljoinpass' element={<PBLjoinpass/>}></Route>
      <Route path='/pbls' element={<PblProvider><PBL/></PblProvider>}></Route>
      <Route path='/newsupervisordashboard' element={<Supervisordashboard/>}></Route>
      <Route path='/links' element={<Links/>}></Route>
      <Route path='/updatemarks' element={<Updatemarks/>}></Route>
    
        <Route
          path='/hackathons'
          element={
            <HackathonsProvider>
              <Hackathons />
            </HackathonsProvider>
          }
        />
        <Route path='/judges' element={<JudgesPage/>}></Route>
      </Routes>
    </div>
  )
}

export default Routing