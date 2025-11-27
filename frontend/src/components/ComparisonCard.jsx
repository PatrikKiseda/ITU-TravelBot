import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchExpandedOffer, confirmTravel, updateNote } from '../services/api'
import InlineNote from './InlineNote'
import './ComparisonCard.css'

function ComparisonCard({ offer, onStatusChange, onSkip, comparisonOffers, currentIndex }) {
  const navigate = useNavigate()
  const [expandedData, setExpandedData] = useState(null)
  const [loadingExpand, setLoadingExpand] = useState(false)
  const [loadingConfirm, setLoadingConfirm] = useState(false)

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
    const housing = offer.price_housing || 0
    const food = offer.price_food || 0
    const transport = offer.price_transport_amount || 0
    const minPrice = housing + food + transport
    const maxPrice = minPrice + 200
    return { min: minPrice, max: maxPrice }
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

  return (
    <div className="comparison-card">
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

        <div className="comparison-price">
          <div className="price-range">${priceRange.min}-${priceRange.max}</div>
          <div className="price-breakdown">
            <div className="price-item">
              <span>✈️</span> ${transport}-${transport + 100}
            </div>
            <div className="price-item">
              <span>🏠</span> ${housing}-${housing + 150}
            </div>
            <div className="price-item">
              <span>🍴</span> ${food}-${food + 200}
            </div>
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


