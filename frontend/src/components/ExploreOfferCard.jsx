import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'
import { fetchExpandedOffer, confirmTravel, updateNote } from '../services/api'
import InlineNote from './InlineNote'
import './ExploreOfferCard.css'

function ExploreOfferCard({ offer, onStatusChange, onCompareToggle, isComparing }) {
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
    const maxPrice = minPrice + 200
    return { min: minPrice, max: maxPrice }
  }

  const handleExpand = async (e) => {
    // Don't expand if clicking on action buttons or note area
    if (e && (e.target.closest('.card-actions') || e.target.closest('.inline-note') || e.target.closest('.confirm-travel-button'))) {
      return
    }

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
      const order = await confirmTravel(offer.id, 1, offer.price_transport_mode || 'plane')
      navigate(`/orders/${order.id}`)
    } catch (err) {
      console.error('Failed to confirm travel:', err)
      alert('Failed to confirm travel: ' + (err.message || 'Unknown error'))
    } finally {
      setLoadingConfirm(false)
    }
  }

  const handleNoteSave = async (offerId, noteText) => {
    try {
      await updateNote(offerId, noteText)
    } catch (err) {
      console.error('Failed to save note:', err)
    }
  }

  const getStatusColor = () => {
    const status = offer.status
    if (status === 'ACCEPTED') return '#2a3a2a'  // greenish-grey
    if (status === 'REJECTED') return '#3a2a2a'  // reddish-grey
    return '#2a2a2a'  // neutral grey (UNDECIDED or null)
  }

  const cycleStatus = () => {
    const currentStatus = offer.status
    let newStatus
    if (!currentStatus || currentStatus === 'UNDECIDED') {
      newStatus = 'ACCEPTED'
    } else if (currentStatus === 'ACCEPTED') {
      newStatus = 'REJECTED'
    } else {
      newStatus = 'UNDECIDED'
    }
    onStatusChange(offer.id, newStatus)
  }

  const downgradeStatus = () => {
    const currentStatus = offer.status
    let newStatus
    if (currentStatus === 'ACCEPTED') {
      newStatus = 'UNDECIDED'
    } else if (currentStatus === 'UNDECIDED' || !currentStatus) {
      newStatus = 'REJECTED'
    } else {
      return // Already rejected
    }
    onStatusChange(offer.id, newStatus)
  }

  const upgradeStatus = () => {
    const currentStatus = offer.status
    let newStatus
    if (currentStatus === 'REJECTED') {
      newStatus = 'UNDECIDED'
    } else if (currentStatus === 'UNDECIDED' || !currentStatus) {
      newStatus = 'ACCEPTED'
    } else {
      return // Already accepted
    }
    onStatusChange(offer.id, newStatus)
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: (e) => {
      if (e.event) {
        e.event.stopPropagation()
        e.event.preventDefault()
      }
      downgradeStatus()
    },
    onSwipedRight: (e) => {
      if (e.event) {
        e.event.stopPropagation()
        e.event.preventDefault()
      }
      upgradeStatus()
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
    stopPropagation: true,
    preventDefaultTouchmoveEvent: true,
  })

  const priceRange = calculatePriceRange()
  const housing = offer.price_housing || 0
  const food = offer.price_food || 0
  const transport = offer.price_transport_amount || 0
  const bgColor = getStatusColor()

  return (
    <div 
      className={`explore-offer-card ${expanded ? 'expanded' : ''}`}
      style={{ backgroundColor: bgColor }}
      {...swipeHandlers}
      onClick={handleExpand}
    >
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

          {expanded && (
            <div className="expanded-actions" onClick={(e) => e.stopPropagation()}>
              <InlineNote
                offerId={offer.id}
                initialNote={offer.note || ''}
                onSave={handleNoteSave}
              />
              
              <button 
                className="confirm-travel-button"
                onClick={handleConfirmTravel}
                disabled={loadingConfirm}
              >
                {loadingConfirm ? '...' : 'Confirm travel'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card-compare-checkbox" onClick={(e) => e.stopPropagation()}>
        <label className="compare-checkbox-label">
          <input
            type="checkbox"
            checked={isComparing || false}
            onChange={(e) => {
              e.stopPropagation()
              if (onCompareToggle) {
                onCompareToggle(offer.id, e.target.checked)
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="compare-checkbox-input"
          />
          <span className="compare-checkbox-text">Compare</span>
        </label>
      </div>

      <div className="card-expand-bar" onClick={(e) => e.stopPropagation()}>
        <button 
          className="expand-button-bar" 
          onClick={handleExpand}
          disabled={loadingExpand}
        >
          {loadingExpand ? 'Loading...' : expanded ? '▲ Collapse' : '▼ Expand'}
        </button>
      </div>
    </div>
  )
}

export default ExploreOfferCard
