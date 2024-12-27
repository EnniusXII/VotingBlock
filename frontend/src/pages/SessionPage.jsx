import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { getSessionDetails, getSessionTally, getUserHasVoted, vote } from '../services/blockchainInteractions';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import "../styles/pages/Session.css"

const SessionPage = () => {
    const { sessionId } = useParams();
    const [session, setSession] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const userAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

    useEffect(() => {(async () => {
        setLoading(true);
        try {
            const details = await getSessionDetails(sessionId);
            const tally = await getSessionTally(sessionId);
            const userVotingStatus = await getUserHasVoted(sessionId, userAddress);

            const totalVotes = tally.reduce((acc, votes) => acc + votes, 0)
            setSession({...details, tally, totalVotes });
            setHasVoted(userVotingStatus);
        } catch (error) {
            toast.error("Failed to load session details.");
        } finally {
            setLoading(false);
        }
        })();
    }, [sessionId, userAddress]);

    const handleVote = async (candidateIndex) => {
        setLoading(true);
        try {
            await vote(sessionId, candidateIndex);
        
            const updatedDetails = await getSessionDetails(sessionId);
            const updatedTally = await getSessionTally(sessionId);
            const userVotingStatus = await getUserHasVoted(sessionId, userAddress);

            const totalVotes = updatedTally.reduce((acc, votes) => acc + votes, 0);
            setSession({ ...updatedDetails, tally: updatedTally, totalVotes });
            setHasVoted(userVotingStatus);
            toast.success("Vote successfully cast!");
        } catch (error) {
            toast.error("Failed to cast vote.");
        } finally {
            setLoading(false);
        }    
    };

    if (loading) return <LoadingSpinner />;

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
                    <div 
                        key={i} 
                        className="candidate"
                        onClick={() => navigate(`/sessions/${sessionId}/candidate/${i}/voters`)}
                    >
                        <div
                            className="candidate-bar"
                            style={{ width: `${percentage}%` }}
                        ></div>
                        <div 
                            className="candidate-content"
                        >
                            <span>{candidate}: {session.tally[i]} votes</span>
                            {session.isActive && !hasVoted && (
                                <button onClick={(e) => {e.stopPropagation(), handleVote(i)}}>Vote</button>
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
