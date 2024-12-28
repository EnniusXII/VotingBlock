import abi from "../../VotingBlockABI.json";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export let provider = null;
export let signer = null;
let contract;

export const initWeb3 = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        provider = new ethers.BrowserProvider(window.ethereum);
  
        await provider.send("eth_requestAccounts", []);
  
        signer = await provider.getSigner();
  
        contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      } catch (error) {
        console.error("User denied account access or error occurred:", error);
      }
    } else {
      console.error("MetaMask not found. Please install it or use a different Ethereum wallet.");
    }
};

export const getUserAddress = async () => {
    if (!signer) {
      throw new Error("Signer not found. Did you forget to call initWeb3()?");
    }
    return signer.getAddress();
};

export const createVotingSession = async(title, candidates, durationSeconds) => {
    if (!contract) await initWeb3();

    try {
        const tx = await contract.createVotingSession(title, candidates, durationSeconds);
        await tx.wait();
    } catch (error) {
        console.error("Failed to create session:", error);
    }
};

export const getSessionDetails = async(sessionId) => {
    if (!contract) await initWeb3();
  
    try {
    const [title, candidates, isActive, resultsCalculated, startTimestamp, endTimestamp] = 
        await contract.getSessionInfo(sessionId);

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
        return null;
    }
};

export const getSessionCount = async() => {
    if (!contract) await initWeb3();
    try {
        const count = await contract.votingSessionCount();
        return Number(count);
    } catch (error) {
        console.error("Failed to get session count:", error);
    }
};

export const getAllSessions = async() => {
    if (!contract) await initWeb3();
    try {
        const count = await getSessionCount();

        const sessions = [];
        for (let i = 0; i < count; i++) {
          const sessionDetails = await getSessionDetails(i);
          sessions.push(sessionDetails);
        }
        
        return sessions;
    } catch (error) {
        console.error("Failed to retrieve sessions:", error);
        return [];
    }

};

export const getSessionTally = async(sessionId) => {
    if (!contract) await initWeb3();
    try {
        const tally = await contract.getTally(sessionId);

        return tally.map(t => Number(t));
    } catch (error) {
        console.error("Failed to get session count:", error);
        return [];
    }
};

export const getUserHasVoted = async(sessionId, userAddress) => {
    if (!contract) await initWeb3();
    try {
        const userHasVoted = await contract.hasVoted(sessionId, userAddress);

        return userHasVoted;
    } catch (error) {
        console.error("Failed to get user voting status:", error);
    }
};

export const vote = async(sessionId, candidateIndex) => {
    if (!contract) await initWeb3();
    try {
        const tx = await contract.vote(sessionId, candidateIndex);
        await tx.wait();  
    } catch (error) {
        console.error("Failed to cast vote:", error);
    }
};

export const getVotersForCandidate = async (sessionId, candidateIndex, fromBlock = 7369796, toBlock = "latest") => {
    if (!contract) await initWeb3();
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