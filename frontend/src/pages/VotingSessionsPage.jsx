import React from 'react'
import { getSessionDetails } from '../services/blockchainInteractions';

const VotingSessionsPage = () => {

    const handleGetSession = async (e) => {
            e.preventDefault();
    
            await getSessionDetails(0);
    };
  return (
    <div>
        <h2>Voting Sessions</h2>

        <button onClick={handleGetSession}>Get session</button>
      
    </div>
  )
}

export default VotingSessionsPage
