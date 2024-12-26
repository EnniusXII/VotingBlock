import React, { useState } from 'react'

const Header = () => {
    const [sideMenuOpen, setSideMenuOpen] = useState(false);

    const toggleSideMenu = () => {
        setSideMenuOpen(!sideMenuOpen);
    };
  return (
    <header>
        <h2>VotingBlock</h2>

        <button>Connect Wallet</button>

        <button onClick={toggleSideMenu}>
          &#9776; {/* This is a hamburger icon */}
        </button>
      
    </header>
    
  )
}

export default Header
