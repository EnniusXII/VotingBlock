import React, { useEffect, useState } from 'react'
import { getAllSessions, getSessionDetails } from '../services/blockchainInteractions';
import { useNavigate } from 'react-router-dom';

const VotingSessionsPage = () => {
    const [sessions, setSessions] = useState([]);
    const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
    const navigate = useNavigate();

    useEffect(() => {(async () => {
          const allSessions = await getAllSessions();
          setSessions(allSessions);
        })();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Math.floor(Date.now() / 1000));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTimeRemaining = (seconds) => {
        if (seconds <= 0) {
            return "Session ended";
        }
    
        const days = Math.floor(seconds / (24 * 3600));
        const hours = Math.floor((seconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
    
        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} remaining`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''} remaining`;
        } else {
            return `${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''} remaining`;
        }
    };

    const handleGetSession = async (e) => {
            e.preventDefault();
    
            // await getSessionDetails(0);
            await getAllSessions();
            
    };
  return (
    <div>
        <h2>Voting Sessions</h2>

        <button onClick={handleGetSession}>Get session</button>

        {sessions.map(session => {
            const timeRemaining = session.isActive ? (session.endTimestamp - currentTime) : 0;
            return (
                <div key={session.sessionId} onClick={() => navigate(`/sessions/${session.sessionId}`)}>
                    <h3>{session.title}</h3>
                    <p>{formatTimeRemaining(timeRemaining)}</p>
                </div>
            );
        })}
    </div>
  )
}

export default VotingSessionsPage
