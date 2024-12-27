import React, { useState } from 'react'
import { createVotingSession } from '../services/blockchainInteractions';
import "../styles/pages/CreateSession.css"

const CreateSessionPage = () => {
    const [title, setTitle] = useState("Best Fruit");
    const [candidates, setCandidates] = useState(["Banana", "Mango"]);
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);

    const handleCreateSession = async (e) => {
        e.preventDefault();

        const duration = (days * 24 * 3600) + (hours * 3600) + (minutes * 60);

        await createVotingSession(title, candidates, duration);
    };

  return (
    <div>
        <h2>Create a Voting Session</h2>

        <form onSubmit={handleCreateSession}>
          <input
            placeholder="Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {candidates.map((c, i) => (
            <input key={i} placeholder={`Candidate ${i+1}`} value={c} onChange={e => {
              const newCandidates = [...candidates];
              newCandidates[i] = e.target.value;
              setCandidates(newCandidates);
            }} />
          ))}
          <button type="button" onClick={() => setCandidates([...candidates, ""])}>Add Candidate</button>
          
          <div className="duration-inputs">
              <label>
                  Days:
                  <input
                      type="number"
                      min="0"
                      value={days}
                      onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                  />
              </label>
              <label>
                  Hours:
                  <input
                      type="number"
                      min="0"
                      max="23"
                      value={hours}
                      onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                  />
              </label>
              <label>
                  Minutes:
                  <input
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                  />
              </label>
          </div>
          <button type="submit">Create</button>
        </form> 
    </div>
  )
}

export default CreateSessionPage
