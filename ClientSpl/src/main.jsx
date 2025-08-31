import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AutoAuth from './hooks/AutoAuth.jsx'
import {HackathonsProvider} from './hooks/HackathonContext.jsx'

createRoot(document.getElementById('root')).render(
   
    
        <AutoAuth>
      
        <BrowserRouter>
        <App/>
        </BrowserRouter>
     
        </AutoAuth>

    
    
    
)
