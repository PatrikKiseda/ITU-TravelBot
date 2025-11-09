import React, { useState, useEffect } from 'react'
import ExploreOfferCard from '../components/ExploreOfferCard'
import { fetchAvailableOffers, acceptOffer, rejectOffer } from '../services/api'
import './Explore.css'

function Explore() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadOffers()
  }, [])

  const loadOffers = async () => {
    try {
      setLoading(true)
      console.log('[Explore] Loading available offers')
      const data = await fetchAvailableOffers()
      console.log('[Explore] Received offers:', data)
      setOffers(data || [])
      setError(null)
    } catch (err) {
      console.error('[Explore] Error loading offers:', err)
      setError('Failed to load destinations: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (offerId) => {
    try {
      console.log('[Explore] Accepting offer:', offerId)
      await acceptOffer(offerId)
      // Remove accepted offer from list
      setOffers(offers.filter(offer => offer.id !== offerId))
      console.log('[Explore] Offer accepted, removed from list')
    } catch (err) {
      console.error('[Explore] Error accepting offer:', err)
      alert('Failed to accept offer: ' + (err.message || 'Unknown error'))
    }
  }

  const handleReject = async (offerId) => {
    try {
      console.log('[Explore] Rejecting offer:', offerId)
      await rejectOffer(offerId)
      // Remove rejected offer from list
      setOffers(offers.filter(offer => offer.id !== offerId))
      console.log('[Explore] Offer rejected, removed from list')
    } catch (err) {
      console.error('[Explore] Error rejecting offer:', err)
      alert('Failed to reject offer: ' + (err.message || 'Unknown error'))
    }
  }

  if (loading) {
    return <div className="explore-page"><div className="loading">Loading destinations...</div></div>
  }

  if (error) {
    return <div className="explore-page"><div className="error">{error}</div></div>
  }

  return (
    <div className="explore-page">
      <div className="explore-content">
        {offers.length === 0 ? (
          <div className="empty-state">
            <h2>No destinations available</h2>
            <p>Check back later or create some offers as a travel agent!</p>
          </div>
        ) : (
          <div className="offers-list">
            {offers.map((offer) => (
              <ExploreOfferCard
                key={offer.id}
                offer={offer}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Explore

