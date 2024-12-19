// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract VotingBlock {

    struct VotingSession {
        string title;
        string[] candidates;
        bool isActive;
        uint startTimestamp;
        uint endTimestamp;
        bool resultsCalculated;
        uint[] finalTally;
        mapping(address => bool) hasVoted;
    }

    mapping(uint => VotingSession) public votingSessions;
    uint public votingSessionCount;

    event VotingSessionCreated(
        uint indexed sessionId, 
        string title, 
        string[] candidates, 
        uint startTimestamp, 
        uint endTimestamp
    );

    event VoteCast(
        uint indexed sessionId, 
        address indexed voter, 
        uint candidateIndex
    );

    event ResultsCalculated(
        uint indexed sessionId, 
        uint[] tally
    );

    function createVotingSession(
        string memory _title,
        string[] memory _candidates,
        uint _durationInSeconds
    ) external returns (uint sessionId) {
        require(_candidates.length > 1, "Need at least two candidates.");
        require(_durationInSeconds > 0, "Duration must be greater than zero.");

        for (uint i = 0; i < _candidates.length; i++) {
            for (uint j = i + 1; j < _candidates.length; j++) {
                require(
                    keccak256(bytes(_candidates[i])) != keccak256(bytes(_candidates[j])), 
                    "Duplicate candidate found."
                );
            }
        }

        sessionId = votingSessionCount;
        votingSessionCount++;

        VotingSession storage session = votingSessions[sessionId];
        session.title = _title;
        session.candidates = _candidates;
        session.isActive = true;
        session.startTimestamp = block.timestamp;
        session.endTimestamp = block.timestamp + _durationInSeconds;
        session.finalTally = new uint[](_candidates.length);

        emit VotingSessionCreated(
            sessionId, 
            _title, 
            _candidates, 
            session.startTimestamp, 
            session.endTimestamp
        );
    }

    function vote(uint _sessionId, uint _candidateIndex) external {
        VotingSession storage session = votingSessions[_sessionId];

        require(session.isActive, "Voting session is not active.");
        require(block.timestamp <= session.endTimestamp, "Voting session has ended.");
        require(!session.hasVoted[msg.sender], "You have already voted.");
        require(_candidateIndex < session.candidates.length, "Invalid candidate index.");

        session.hasVoted[msg.sender] = true;
        session.finalTally[_candidateIndex] += 1;

        emit VoteCast(_sessionId, msg.sender, _candidateIndex);
    }

    function calculateResults(uint _sessionId) external {
        require(_sessionId < votingSessionCount, "Invalid session ID.");
        
        VotingSession storage session = votingSessions[_sessionId];

        require(session.isActive, "Session already finalized.");
        require(block.timestamp > session.endTimestamp, "Voting period is still active.");
        require(!session.resultsCalculated, "Results already calculated.");

        session.resultsCalculated = true;
        session.isActive = false;

        emit ResultsCalculated(_sessionId, session.finalTally);
    }

    function getWinners(uint _sessionId) external view returns (string[] memory winners) {
        VotingSession storage session = votingSessions[_sessionId];
        require(session.resultsCalculated, "Results not calculated yet.");

        uint highestVoteCount = 0;
        uint winnersCount = 0;

        for (uint i = 0; i < session.finalTally.length; i++) {
            if (session.finalTally[i] > highestVoteCount) {
                highestVoteCount = session.finalTally[i];
                winnersCount = 1;
            } else if (session.finalTally[i] == highestVoteCount) {
                winnersCount++;
            }
        }

        winners = new string[](winnersCount);
        uint index = 0;
        for (uint i = 0; i < session.finalTally.length; i++) {
            if (session.finalTally[i] == highestVoteCount) {
                winners[index] = session.candidates[i];
                index++;
            }
        }
    }

    function getSessionInfo(uint _sessionId) external view returns (
        string memory title,
        string[] memory candidates,
        bool isActive,
        bool resultsCalculated,
        uint startTimestamp,
        uint endTimestamp
    ) {
        VotingSession storage session = votingSessions[_sessionId];
        return (
            session.title,
            session.candidates,
            session.isActive,
            session.resultsCalculated,
            session.startTimestamp,
            session.endTimestamp
        );
    }

    function getTally(uint _sessionId) external view returns (uint[] memory tally) {
        VotingSession storage session = votingSessions[_sessionId];
        return session.finalTally;
    }

    function hasVoted(uint _sessionId, address _voter) external view returns (bool) {
        return votingSessions[_sessionId].hasVoted[_voter];
    }
}