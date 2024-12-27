import React from 'react'
import { NavLink } from 'react-router-dom'
import "../styles/components/SideMenu.css"

const SideMenu = ({ isOpen, onClose }) => {
  return (
    <div>
        {/* Overlay */}
        <div className={`overlay ${isOpen ? "visible" : ""}`} onClick={onClose}></div>

        <div className={`side-menu ${isOpen ? "open" : ""}`}>
            <button className="close-btn" onClick={onClose}>
                &times;
            </button>
            <ul>
                <li>
                <NavLink to="/" onClick={onClose}>
                    Home
                </NavLink>
                </li>
                <li>
                <NavLink to="/create" onClick={onClose}>
                    Create Session
                </NavLink>
                </li>
                <li>
                <NavLink to="/sessions" onClick={onClose}>
                    View Sessions
                </NavLink>
                </li>
            </ul>
        </div>
    </div>
  )
}

export default SideMenu
