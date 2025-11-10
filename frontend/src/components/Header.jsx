import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  const handleLogoClick = () => {
    navigate('/explore')
  }

  const handlePlanClick = () => {
    navigate('/plan')
  }

  const handleExploreClick = () => {
    navigate('/explore')
  }
  const handleAdminClick = () => {
    navigate('/admin')
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button className="logo-button" onClick={handleLogoClick} aria-label="Go to Explore">
            <img 
              src="/travelbot-logo.png" 
              alt="Travelbot" 
              className="logo-image"
              onError={(e) => {
                // Fallback to text if image doesn't exist
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
            <span className="logo-text-fallback" style={{ display: 'none' }}>Travelbot</span>
          </button>
          <div className="nav-buttons">
            <button
                className={`nav-button nav-button-plan ${currentPath === '/plan' ? 'active' : ''}`}
                onClick={handlePlanClick}
            >
              Plan
            </button>
            <button
                className={`nav-button nav-button-explore ${currentPath === '/explore' ? 'active' : ''}`}
                onClick={handleExploreClick}
            >
              Explore
            </button>
            <button
                className={`nav-button nav-button-admin ${currentPath === '/admin' ? 'active' : ''}`}
                onClick={handleAdminClick}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
