import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { getSessionDetails, getSessionTally } from '../services/blockchainInteractions';

const SessionPage = () => {
    const { sessionId } = useParams();
    const [session, setSession] = useState(null);

    useEffect(() => {(async () => {
          const details = await getSessionDetails(sessionId);
          const tally = await getSessionTally(sessionId);
          console.log("Details: ", details);
          
          setSession({...details, tally});
        })();
    }, [sessionId]);

    if (!session) {
        return <div>Loading...</div>;
    }

  return (
    <div>
        <h2>{session.title}</h2>
        <div>
            {session.candidates.map((candidate, i) => (
                <div key={i}>
                    {candidate}: {session.tally[i]} votes
                </div>
            ))}
        </div>
      
    </div>
  )
}

export default SessionPage
