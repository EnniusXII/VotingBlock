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