import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './layouts/Navbar'
import Landingpage from './components/Landingpage'
import Dropdown from './layouts/Dropdown'
import Profileinfo from './components/Profileinfo'
import Settings from './components/Settings'
import Changepassword from './components/Changepassword'
import Hackathons from './components/Hackathons'
import Projects from './components/Projects'
import Loginpage from './components/Loginpage'
import SignupOps from './components/SignupOps'
import SignupForm from './components/SignupForm'
import Routes from './routes/Routing'
import HackathonHostingpage from './components/HackathonHostingpage'
function App() {



  return (
    <div className='bg-[#E9F0FF]'>

        <Navbar/>
        <Routes/>
    </div>
    
  )
}

export default App
