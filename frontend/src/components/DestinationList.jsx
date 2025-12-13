import React, { useState, useEffect } from 'react'
import DestinationCard from './DestinationCard'
import { fetchAcceptedOffers, rejectOffer } from '../services/api'
import './DestinationList.css'

function DestinationList({ sortBy, sortOrder, onSortChange }) {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadOffers()
  }, [sortBy, sortOrder])

  const loadOffers = async () => {
    try {
      setLoading(true)
      console.log('[DestinationList] Loading offers with sort:', sortBy, sortOrder)
      const data = await fetchAcceptedOffers(sortBy, sortOrder)
      console.log('[DestinationList] Received offers:', data)
      setOffers(data || [])
      setError(null)
    } catch (err) {
      console.error('[DestinationList] Error loading offers:', err)
      setError('Failed to load destinations: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (offerId) => {
    try {
      await rejectOffer(offerId)
      setOffers((prev) => prev.filter((offer) => offer.id !== offerId))
    } catch (err) {
      console.error('[DestinationList] Error removing offer:', err)
      alert('Failed to remove destination: ' + (err.message || 'Unknown error'))
    }
  }

  if (loading) {
    return <div className="loading">Loading destinations...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="destination-list">
      <div className="cards-container">
        {offers.length === 0 ? (
          <div className="empty-state">No accepted destinations yet.</div>
        ) : (
          offers.map((offer) => (
            <DestinationCard
              key={offer.id}
              offer={offer}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default DestinationList
