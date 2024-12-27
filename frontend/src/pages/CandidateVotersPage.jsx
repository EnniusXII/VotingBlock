import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { getVotersForCandidate } from '../services/blockchainInteractions';
import "../styles/pages/CandidateVoters.css"

const PAGE_SIZE = 10;

const CandidateVotersPage = () => {
    const { sessionId, candidateIndex } = useParams();
    const [voters, setVoters] = useState([]);
    const [page, setPage] = useState(0);

    useEffect(() => {(async () => {
          const votersList = await getVotersForCandidate(Number(sessionId), Number(candidateIndex));
          setVoters(votersList);
        })();
    }, [sessionId, candidateIndex]);

    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const paginatedVoters = voters.slice(start, end);

    const nextPage = () => { if (end < voters.length) setPage(page + 1); };
    const prevPage = () => { if (page > 0) setPage(page - 1); };

  return (
    <div className='candidate-voters-page'>
      <h2>Voters for candidate {candidateIndex} in session {sessionId}</h2>
      <ul>
        {paginatedVoters.map((voter, i) => (
          <li key={i}>
            {/* <a 
              href={`https://etherscan.io/address/${voter}`}
              target="_blank" 
              rel="noopener noreferrer"
            >
              
            </a> */}
            {voter}
          </li>
        ))}
      </ul>
      <button disabled={page === 0} onClick={prevPage}>Previous</button>
      <button disabled={end >= voters.length} onClick={nextPage}>Next</button>
      <p>Page {page + 1} of {Math.ceil(voters.length / PAGE_SIZE)}</p>
    </div>
  )
}

export default CandidateVotersPage
