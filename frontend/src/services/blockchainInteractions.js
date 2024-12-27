import abi from "../../VotingBlockABI.json";
import { ethers } from "ethers";

const PROVIDER_URL = import.meta.env.VITE_PROVIDER_URL;
const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

export const createVotingSession = async(title, candidates, durationSeconds) => {
    console.log(title, candidates, durationSeconds);

    try {
        await contract.createVotingSession(title, candidates, durationSeconds);
    } catch (error) {
        console.error("Failed to create session:", error);
    }
};

export const getSessionDetails = async(sessionId) => {
  
    try {
    const [title, candidates, isActive, resultsCalculated, startTimestamp, endTimestamp] = 
        await contract.getSessionInfo(sessionId);

        console.log("Session ID:", sessionId, "Title:", title, candidates, isActive, resultsCalculated, Number(startTimestamp), endTimestamp)

        return {
            sessionId,
            title,
            candidates,
            isActive,
            resultsCalculated,
            startTimestamp: Number(startTimestamp),
            endTimestamp: Number(endTimestamp),
        }
    } catch (error) {
        console.error("Failed to get session:", error);
    }
};

export const getSessionCount = async() => {
    try {
        const count = await contract.votingSessionCount();
        return Number(count);
    } catch (error) {
        console.error("Failed to get session count:", error);
    }
};

export const getAllSessions = async() => {
    try {
        const count = await getSessionCount();

        const sessions = [];
        for (let i = 0; i < count; i++) {
          const sessionDetails = await getSessionDetails(i);
          sessions.push(sessionDetails);
        }
        console.log(sessions);
        
        return sessions;
    } catch (error) {
        console.error("Failed to retrieve sessions:", error);
    }

};

export const getSessionTally = async(sessionId) => {
    try {
        const tally = await contract.getTally(sessionId);

        return tally.map(t => Number(t));
    } catch (error) {
        console.error("Failed to get session count:", error);
    }
};

export const getUserHasVoted = async(sessionId, userAddress) => {
    try {
        const userHasVoted = await contract.hasVoted(sessionId, userAddress);

        return userHasVoted;
    } catch (error) {
        console.error("Failed to get user voting status:", error);
    }
};

export const vote = async(sessionId, candidateIndex) => {
    try {
        const tx = await contract.vote(sessionId, candidateIndex);
        await tx.wait();  
    } catch (error) {
        console.error("Failed to cast vote:", error);
    }
};

export const getVotersForCandidate = async (sessionId, candidateIndex, fromBlock = 0, toBlock = "latest") => {
    try {
        const sessionIdNum = Number(sessionId);
        const candidateIndexNum = Number(candidateIndex);

        const eventFilter = contract.filters.VoteCast(sessionIdNum, null, candidateIndexNum);

        const logs = await provider.getLogs({
            fromBlock,
            toBlock,
            address: CONTRACT_ADDRESS,
            topics: eventFilter.topics,
        });

        const parsedLogs = logs
            .map((log) => {
                try {
                    return contract.interface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .filter((parsedLog) => parsedLog && parsedLog.name === "VoteCast");

        return parsedLogs.map((log) => log.args.voter);

    } catch (error) {
    console.error("Failed to get voters for candidate:", error);
    return [];
    }
};