import React, { useState, useEffect } from 'react'
import DestinationCard from './DestinationCard'
import { fetchAcceptedOffers } from '../services/api'
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
    // TODO: Implement delete functionality
    console.log('Delete offer:', offerId)
    // After delete, reload offers
    loadOffers()
  }

  const handleAddNote = (offerId) => {
    // TODO: Implement note modal/input
    const noteText = prompt('Enter your note:')
    if (noteText) {
      console.log('Adding note to offer:', offerId, noteText)
      // TODO: Call addNote API
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
              onAddNote={handleAddNote}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default DestinationList
