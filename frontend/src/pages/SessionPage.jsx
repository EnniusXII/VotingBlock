import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { getSessionDetails, getSessionTally, getUserHasVoted, vote } from '../services/blockchainInteractions';
import "../styles/pages/SessionPage.css"

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

          const totalVotes = tally.reduce((acc, votes) => acc + votes, 0)
          setSession({...details, tally, totalVotes });
          setHasVoted(userVotingStatus);
        })();
    }, [sessionId, userAddress]);

    const handleVote = async (candidateIndex) => {
        await vote(sessionId, candidateIndex);
        
        const updatedDetails = await getSessionDetails(sessionId);
        const updatedTally = await getSessionTally(sessionId);
        const userVotingStatus = await getUserHasVoted(sessionId, userAddress);

        const totalVotes = updatedTally.reduce((acc, votes) => acc + votes, 0);
        setSession({ ...updatedDetails, tally: updatedTally, totalVotes });
        setHasVoted(userVotingStatus);
    };

    if (!session) {
        return <div>Loading...</div>;
    }

  return (
    <div className='session-page'>
        <h2>{session.title}</h2>
        <div>
            {session.candidates.map((candidate, i) => {
                const percentage = session.totalVotes > 0
                    ? (session.tally[i] / session.totalVotes) * 100
                    : 0;

                return (
                    <div key={i} className="candidate">
                        <div
                            className="candidate-bar"
                            style={{ width: `${percentage}%` }}
                        ></div>
                        <div className="candidate-content">
                            <span>{candidate}: {session.tally[i]} votes</span>
                            {session.isActive && !hasVoted && (
                                <button onClick={() => handleVote(i)}>Vote</button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
        {hasVoted && <p>You have voted in this session.</p>}
        {!session.isActive && <p>This voting session is no longer active.</p>}
      
    </div>
  )
}

export default SessionPage
