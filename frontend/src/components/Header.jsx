import React, { useContext, useState } from 'react'
import SideMenu from './SideMenu';
import "../styles/components/Header.css"
import { NavLink } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';

const Header = () => {
    const [sideMenuOpen, setSideMenuOpen] = useState(false);
    const { userAddress, connectWallet, isConnected } = useContext(Web3Context);

    const toggleSideMenu = () => {
        setSideMenuOpen(!sideMenuOpen);
    };

    const formatAddress = (userAddress) => `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;

  return (
    <>
      <header>
          <NavLink to="/">
            <h2>VotingBlock</h2>
          </NavLink>
          
          <div className='header-right'>
              {isConnected && userAddress ? (
                  <button>{formatAddress(userAddress)}</button>
              ) : (
                  <button onClick={connectWallet}>Connect Wallet</button>
              )}

            <button className='hamburger-menu' onClick={toggleSideMenu}>
              &#9776; {/* This is a hamburger icon */}
            </button>
          </div>
        
      </header>

      <SideMenu isOpen={sideMenuOpen} onClose={toggleSideMenu} />
    </>
  )
}

export default Header
