import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchExpandedOffer, confirmTravel } from '../services/api'
import './DestinationCard.css'

function DestinationCard({ offer, onDelete, onAddNote }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const [expandedData, setExpandedData] = useState(null)
  const [loadingExpand, setLoadingExpand] = useState(false)
  const [loadingConfirm, setLoadingConfirm] = useState(false)

  const calculatePriceRange = () => {
    const housing = offer.price_housing || 0
    const food = offer.price_food || 0
    const transport = offer.price_transport_amount || 0
    const minPrice = housing + food + transport
    const maxPrice = minPrice + 200 // Rough estimate for range
    return { min: minPrice, max: maxPrice }
  }

  const handleExpand = async () => {
    if (expanded) {
      setExpanded(false)
      return
    }

    if (expandedData) {
      setExpanded(true)
      return
    }

    try {
      setLoadingExpand(true)
      const data = await fetchExpandedOffer(offer.id)
      setExpandedData(data)
      setExpanded(true)
    } catch (err) {
      console.error('Failed to expand offer:', err)
    } finally {
      setLoadingExpand(false)
    }
  }

  const handleConfirmTravel = async () => {
    try {
      setLoadingConfirm(true)
      // Default values - user will set these in order view
      const order = await confirmTravel(offer.id, 1, offer.price_transport_mode || 'plane')
      // Navigate to order view
      navigate(`/orders/${order.id}`)
    } catch (err) {
      console.error('Failed to confirm travel:', err)
      alert('Failed to confirm travel: ' + (err.message || 'Unknown error'))
    } finally {
      setLoadingConfirm(false)
    }
  }

  const handleAddNote = () => {
    if (onAddNote) {
      onAddNote(offer.id)
    }
  }

  const priceRange = calculatePriceRange()
  const housing = offer.price_housing || 0
  const food = offer.price_food || 0
  const transport = offer.price_transport_amount || 0

  return (
    <div className={`destination-card ${expanded ? 'expanded' : ''}`}>
      <button className="delete-button" onClick={() => onDelete(offer.id)}>
        🗑️
      </button>
      
      <div className="card-content">
        <div className="card-image">
          {offer.image_url ? (
            <img src={offer.image_url} alt={offer.destination_name} />
          ) : (
            <div className="image-placeholder">No Image</div>
          )}
        </div>

        <div className="card-info">
          <h2 className="destination-name">{offer.destination_name}</h2>
          
          <div className="price-section">
            <div className="price-range">
              Price: ${priceRange.min}-${priceRange.max}
            </div>
            
            <div className="price-breakdown">
              <div className="price-item">
                <span className="price-icon">💰</span>
                <span>${housing + food + transport}-${housing + food + transport + 100}</span>
              </div>
              <div className="price-item">
                <span className="price-icon">🏠</span>
                <span>${housing}-${housing + 150}</span>
              </div>
              <div className="price-item">
                <span className="price-icon">🍴</span>
                <span>${food}-${food + 200}</span>
              </div>
            </div>
          </div>

          <div className="description">
            {expanded && expandedData ? (
              <div className="expanded-content">
                <p>{expandedData.extended_description || expandedData.short_description}</p>
                {expandedData.image_credit_author && (
                  <p className="image-credit">
                    Photo by {expandedData.image_credit_author}
                  </p>
                )}
              </div>
            ) : (
              <p>{offer.short_description}</p>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="expanded-actions">
          <button 
            className="add-note-button"
            onClick={handleAddNote}
          >
            Add a note
          </button>
          <button 
            className="confirm-travel-button"
            onClick={handleConfirmTravel}
            disabled={loadingConfirm}
          >
            {loadingConfirm ? '...' : 'Confirm travel'}
          </button>
        </div>
      )}

      <button 
        className="expand-button" 
        onClick={handleExpand}
        disabled={loadingExpand}
      >
        {loadingExpand ? '...' : expanded ? '▲' : '▼'}
      </button>
    </div>
  )
}

export default DestinationCard
