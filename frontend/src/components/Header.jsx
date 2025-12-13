import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FilterBar from './FilterBar'
import './Header.css'

function Header({ filters, onFiltersChange, minPrice, maxPrice, comparingOffers, onEnterComparison, sortBy, sortOrder, onSortChange }) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  const handleLogoClick = () => {
    navigate('/explore')
  }

  const handleExploreClick = () => {
    navigate('/explore')
  }
  const handleAdminClick = () => {
    navigate('/admin')
  }

  const handleOrdersClick = () => {
    navigate('/orders')
  }

  const showFilters = currentPath === '/explore' && filters && !currentPath.includes('comparison')

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-main-row">
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
                className={`nav-button nav-button-explore ${currentPath === '/explore' ? 'active' : ''}`}
                onClick={handleExploreClick}
              >
                Explore
              </button>
              <button
                className={`nav-button nav-button-orders ${currentPath.startsWith('/orders') ? 'active' : ''}`}
                onClick={handleOrdersClick}
              >
                Orders
              </button>
            </div>
            {showFilters && (
              <button
                className="compare-offers-button"
                onClick={onEnterComparison}
              >
                Compare Offers {comparingOffers && comparingOffers.size > 0 ? `(${comparingOffers.size})` : ''}
              </button>
            )}
          </div>
          {showFilters && (
            <div className="header-filters">
              <FilterBar
                filters={filters}
                onFiltersChange={onFiltersChange}
                minPrice={minPrice}
                maxPrice={maxPrice}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
