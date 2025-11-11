import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DestinationList from '../components/DestinationList'
import './Plan.css'

function Plan() {
  const [sortBy, setSortBy] = useState('price')
  const [sortOrder, setSortOrder] = useState('asc')
  const navigate = useNavigate()

  const handleSortChange = (newSort) => {
    if (sortBy === newSort) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSort)
      setSortOrder('asc')
    }
  }

  return (
    <div className="plan-page">
      <div className="plan-header">
        <div className="plan-controls">
          <span className="sort-label">sort by</span>
          <div className="sort-options">
            <div className="sort-group">
              <span className="sort-type-label">price:</span>
              <button
                className={`sort-button ${sortBy === 'price' ? 'active' : ''}`}
                onClick={() => handleSortChange('price')}
              >
                💰
              </button>
            </div>
            <div className="sort-group">
              <span className="sort-type-label">type:</span>
              <button
                className={`sort-button ${sortBy === 'type' ? 'active' : ''}`}
                onClick={() => handleSortChange('type')}
              >
                🏛️
              </button>
            </div>
          </div>
        </div>
        <button
          className="plan-orders-button"
          onClick={() => navigate('/orders')}
        >
          View upcoming travels
        </button>
      </div>
      <main className="plan-content">
        <DestinationList 
          sortBy={sortBy} 
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      </main>
    </div>
  )
}

export default Plan

