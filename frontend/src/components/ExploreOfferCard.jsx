import React, { useState } from 'react'
import { fetchExpandedOffer } from '../services/api'
import './ExploreOfferCard.css'

function ExploreOfferCard({ offer, onAccept, onReject }) {
  const [expanded, setExpanded] = useState(false)
  const [expandedData, setExpandedData] = useState(null)
  const [loadingExpand, setLoadingExpand] = useState(false)

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

  const priceRange = calculatePriceRange()
  const housing = offer.price_housing || 0
  const food = offer.price_food || 0
  const transport = offer.price_transport_amount || 0

  return (
    <div className={`explore-offer-card ${expanded ? 'expanded' : ''}`}>
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
                <span className="price-icon">✈️</span>
                <span>${transport}-${transport + 100}</span>
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

      <div className="card-actions">
        <button 
          className="expand-button" 
          onClick={handleExpand}
          disabled={loadingExpand}
        >
          {loadingExpand ? '...' : expanded ? '▲' : '▼'}
        </button>
        <div className="action-buttons">
          <button 
            className="accept-button"
            onClick={() => onAccept(offer.id)}
            title="Accept"
          >
            ✓
          </button>
          <button 
            className="reject-button"
            onClick={() => onReject(offer.id)}
            title="Reject"
          >
            ✗
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExploreOfferCard

