import React, { useState } from 'react'
import SideMenu from './SideMenu';
import "../styles/components/Header.css"

const Header = () => {
    const [sideMenuOpen, setSideMenuOpen] = useState(false);

    const toggleSideMenu = () => {
        setSideMenuOpen(!sideMenuOpen);
    };
  return (
    <>
      <header>
          <h2>VotingBlock</h2>
          
          <div className='header-right'>
            <button>Connect Wallet</button>

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
