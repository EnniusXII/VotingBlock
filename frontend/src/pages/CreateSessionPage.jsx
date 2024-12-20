import React, { useState } from 'react'

const CreateSessionPage = () => {
    const [title, setTitle] = useState("Best Fruit");
    const [candidates, setCandidates] = useState(["Banana", "Mango"]);
    const [duration, setDuration] = useState(36000);

  return (
    <div>
        <h2>Create a Voting Session</h2>

        <form>
          <label>Title: </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label>Candidates: </label>
          <input
            type="text"
            value={candidates}
            onChange={(e) => setCandidates(e.target.value)}
          />
          <label>Duration: </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        <button type="submit">Create</button>
      </form>
      
    </div>
  )
}

export default CreateSessionPage
