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

        console.log("Title:", title, candidates, isActive, resultsCalculated, Number(startTimestamp), endTimestamp)

        return {
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