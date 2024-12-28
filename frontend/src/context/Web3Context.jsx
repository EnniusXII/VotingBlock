import React, { createContext, useState, useEffect } from "react";
import { initWeb3, getUserAddress } from "../services/blockchainInteractions";

export const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const [userAddress, setUserAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const connectWallet = async () => {
    try {
      await initWeb3();
      const address = await getUserAddress();
      setUserAddress(address);
      setIsConnected(true);
      setConnectionError(null);
    } catch (error) {
      setConnectionError(error.message);
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <Web3Context.Provider
      value={{
        userAddress,
        isConnected,
        connectionError,
        connectWallet
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};