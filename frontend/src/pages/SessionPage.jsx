import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { getSessionDetails, getSessionTally, getUserHasVoted, vote } from '../services/blockchainInteractions';

const SessionPage = () => {
    const { sessionId } = useParams();
    const [session, setSession] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const userAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

    useEffect(() => {(async () => {
          const details = await getSessionDetails(sessionId);
          const tally = await getSessionTally(sessionId);
          const userVotingStatus = await getUserHasVoted(sessionId, userAddress);
          console.log("Details: ", details);
          console.log("User has voted: ", userVotingStatus);
          
          setSession({...details, tally});
          setHasVoted(userVotingStatus);
        })();
    }, [sessionId, userAddress]);

    const handleVote = async (candidateIndex) => {
        await vote(sessionId, candidateIndex);
        
        const updatedDetails = await getSessionDetails(sessionId);
        const updatedTally = await getSessionTally(sessionId);
        const userVotingStatus = await getUserHasVoted(sessionId, userAddress);

        setSession({ ...updatedDetails, tally: updatedTally });
        setHasVoted(userVotingStatus);
    };

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
                    {session.isActive && !hasVoted && (
                        <button onClick={() => handleVote(i)}>Vote</button>
                    )}
                </div>
            ))}
        </div>
        {hasVoted && <p>You have voted in this session.</p>}
        {!session.isActive && <p>This voting session is no longer active.</p>}
      
    </div>
  )
}

export default SessionPage
