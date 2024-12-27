import React from 'react'
import { NavLink } from 'react-router-dom';
import "../styles/pages/Home.css"

const HomePage = () => {

  return (
    <div className='homepage'>
        <h1>Welcome to VotingBlock</h1>

        <NavLink to="/create">
            <button>Create Voting Session</button>
        </NavLink>
        <NavLink to="/sessions">
            <button>View Voting Sessions</button>
        </NavLink>
    </div>
  )
}

export default HomePage
