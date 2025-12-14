// Author:             Patrik Kišeda ( xkised00 )
// File:                   ComparisonCard.jsx
// Functionality :   card component for displaying offers in comparison view

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchExpandedOffer, confirmTravel, updateNote } from '../services/api'
import InlineNote from './InlineNote'
import './ComparisonCard.css'

function ComparisonCard({ offer, onStatusChange, onSkip, comparisonOffers, currentIndex, comparisonData, isLeft }) {
	// displays offer details with status-based styling
  const navigate = useNavigate()
  const [expandedData, setExpandedData] = useState(null)
  const [loadingExpand, setLoadingExpand] = useState(false)
  const [loadingConfirm, setLoadingConfirm] = useState(false)

  // calculates trip length in days
  const calculateTripLength = () => {
    if (!offer.date_from || !offer.date_to) return 0
    const from = new Date(offer.date_from)
    const to = new Date(offer.date_to)
    const diffTime = Math.abs(to - from)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // calculates total price
  const calculateTotalPrice = () => {
    return (offer.price_housing || 0) + (offer.price_food || 0) + (offer.price_transport_amount || 0)
  }

  React.useEffect(() => {
    // Load expanded data when component mounts
    const loadData = async () => {
      try {
        setLoadingExpand(true)
        const data = await fetchExpandedOffer(offer.id)
        setExpandedData(data)
      } catch (err) {
        console.error('Failed to expand offer:', err)
      } finally {
        setLoadingExpand(false)
      }
    }
    loadData()
  }, [offer.id])

  const calculatePriceRange = () => {
	// calculates price range for display
    const housing = offer.price_housing || 0
    const food = offer.price_food || 0
    const transport = offer.price_transport_amount || 0
    const minPrice = housing + food + transport
    const maxPrice = minPrice + 200
    return { min: minPrice, max: maxPrice }
  }

  const handleConfirmTravel = async () => {
	// creates order and navigates to order detail page
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

  const handleFavorite = () => {
    onStatusChange(offer.id, 'ACCEPTED')
  }

  const handleReject = () => {
    onStatusChange(offer.id, 'REJECTED')
  }

  const handleSkip = () => {
    if (onSkip && comparisonOffers && currentIndex < comparisonOffers.length - 1) {
      onSkip(currentIndex + 1)
    }
  }

  const priceRange = calculatePriceRange()
  const housing = offer.price_housing || 0
  const food = offer.price_food || 0
  const transport = offer.price_transport_amount || 0
  const tripLength = calculateTripLength()
  const totalPrice = calculateTotalPrice()
  const pricePerDay = tripLength > 0 ? Math.round(totalPrice / tripLength) : 0

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const dateRange = offer.date_from && offer.date_to
    ? `${formatDate(offer.date_from)} - ${formatDate(offer.date_to)}`
    : ''

  // get background color for comparison sections
  const getComparisonColor = (colorData) => {
    if (!colorData || !comparisonData) return null
    return isLeft ? colorData.leftColor : colorData.rightColor
  }

  const getStatusColor = () => {
	// returns background color based on offer status
    const status = offer.status
    if (status === 'ACCEPTED') return '#2a3a2a'  // dark green
    if (status === 'REJECTED') return '#3a2a2a'  // dark red
    return '#2a2a2a'  // neutral grey (UNDECIDED or null)
  }

  const bgColor = getStatusColor()

  return (
    <div className="comparison-card" style={{ backgroundColor: bgColor }}>
      <div className="comparison-actions">
        <button className="comparison-action-btn favorite-btn" onClick={handleFavorite} title="Favorite">
          ✓
        </button>
        <button className="comparison-action-btn skip-btn" onClick={handleSkip} title="Skip to next">
          →
        </button>
        <button className="comparison-action-btn reject-btn" onClick={handleReject} title="Reject">
          ✗
        </button>
      </div>

      <div className="comparison-content">
        <div className="comparison-image">
          {offer.image_url ? (
            <img src={offer.image_url} alt={offer.destination_name} />
          ) : (
            <div className="image-placeholder">No Image</div>
          )}
        </div>

        <h2 className="comparison-name">{offer.destination_name}</h2>

        {/* Trip Length Row */}
        {dateRange && (
          <div 
            className="comparison-row comparison-trip-length"
            style={{ backgroundColor: getComparisonColor(comparisonData?.tripLength) || undefined }}
          >
            <div className="comparison-row-label">Trip Length:</div>
            <div className="comparison-row-value">
              {tripLength} days {dateRange && `(${dateRange})`}
            </div>
          </div>
        )}

        {/* Total Price Row */}
        <div 
          className="comparison-row comparison-total-price"
          style={{ backgroundColor: getComparisonColor(comparisonData?.totalPrice) || undefined }}
        >
          <div className="comparison-row-label">Total Price:</div>
          <div className="comparison-row-value">${priceRange.min}-${priceRange.max}</div>
        </div>

        {/* Price Per Day Row */}
        {tripLength > 0 && (
          <div 
            className="comparison-row comparison-price-per-day"
            style={{ backgroundColor: getComparisonColor(comparisonData?.pricePerDay) || undefined }}
          >
            <div className="comparison-row-label">Price Per Day:</div>
            <div className="comparison-row-value">${pricePerDay}/day</div>
          </div>
        )}

        {/* Price Breakdown Rows */}
        <div className="price-breakdown">
          <div 
            className="comparison-row price-item"
            style={{ backgroundColor: getComparisonColor(comparisonData?.transport) || undefined }}
          >
            <div className="comparison-row-label">
              <span>✈️</span> Transport:
            </div>
            <div className="comparison-row-value">${transport}-${transport + 100}</div>
          </div>
          <div 
            className="comparison-row price-item"
            style={{ backgroundColor: getComparisonColor(comparisonData?.housing) || undefined }}
          >
            <div className="comparison-row-label">
              <span>🏠</span> Housing:
            </div>
            <div className="comparison-row-value">${housing}-${housing + 150}</div>
          </div>
          <div 
            className="comparison-row price-item"
            style={{ backgroundColor: getComparisonColor(comparisonData?.food) || undefined }}
          >
            <div className="comparison-row-label">
              <span>🍴</span> Food:
            </div>
            <div className="comparison-row-value">${food}-${food + 200}</div>
          </div>
        </div>

        <div className="comparison-description">
          {expandedData ? (
            <div>
              <p>{expandedData.extended_description || expandedData.short_description}</p>
              {expandedData.image_credit_author && (
                <p className="image-credit">Photo by {expandedData.image_credit_author}</p>
              )}
            </div>
          ) : loadingExpand ? (
            <p>Loading...</p>
          ) : (
            <p>{offer.short_description}</p>
          )}
        </div>

        <div className="comparison-note">
          <InlineNote
            offerId={offer.id}
            initialNote={offer.note || ''}
            onSave={handleNoteSave}
          />
        </div>

        <button 
          className="comparison-confirm-button"
          onClick={handleConfirmTravel}
          disabled={loadingConfirm}
        >
          {loadingConfirm ? '...' : 'Confirm travel'}
        </button>
      </div>
    </div>
  )
}

export default ComparisonCard


