// Author:             Patrik Kišeda ( xkised00 )
// File:                   Compare.jsx
// Functionality :   compare page for side-by-side offer comparison

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import ComparisonView from '../components/ComparisonView'
import { fetchAllOffersWithStatus, updateOfferStatus } from '../services/api'
import './Compare.css'

function Compare({ comparingOffers, filters }) {
	// manages comparison view and filters out accepted/rejected offers
  const navigate = useNavigate()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOffers()
  }, [])

  const loadOffers = async () => {
    try {
      setLoading(true)
      const data = await fetchAllOffersWithStatus({
        ...filters,
        priceMin: filters?.priceRange?.[0] || 0,
        priceMax: filters?.priceRange?.[1] || 10000,
        statusFilter: filters?.statusFilter ? filters.statusFilter.toUpperCase() : null,
        sort: 'status',
        order: 'asc',
      })
      setOffers(data || [])
    } catch (err) {
      console.error('[Compare] Error loading offers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (offerId, newStatus) => {
	// updates offer status and removes from comparison view
    try {
      await updateOfferStatus(offerId, newStatus)
      // Remove offers that are ACCEPTED or REJECTED from the comparison view
      setOffers(prevOffers => 
        prevOffers.filter(offer => offer.id !== offerId)
      )
    } catch (err) {
      console.error('[Compare] Error updating status:', err)
      alert('Failed to update status: ' + (err.message || 'Unknown error'))
    }
  }

  const handleExitComparison = () => {
    navigate('/explore')
  }

  const getComparisonOffers = () => {
	// filters offers for comparison based on selection
    const undecidedOffers = offers.filter(o => !o.status || o.status === 'UNDECIDED')
    
    if (!comparingOffers || comparingOffers.size === 0) {
      return undecidedOffers
    } else if (comparingOffers.size === 1) {
      const selected = offers.find(o => comparingOffers.has(o.id))
      const undecided = undecidedOffers.filter(o => !comparingOffers.has(o.id))
      return selected ? [selected, ...undecided] : undecidedOffers
    } else {
      return offers.filter(o => comparingOffers.has(o.id))
    }
  }

  const comparisonOffersList = getComparisonOffers()

  if (loading) {
    return (
      <>
        <Header 
          filters={null}
          onFiltersChange={null}
          minPrice={0}
          maxPrice={10000}
          comparingOffers={null}
          onEnterComparison={null}
          sortBy={null}
          sortOrder={null}
          onSortChange={null}
        />
        <div className="compare-page"><div className="loading">Loading destinations...</div></div>
      </>
    )
  }

  return (
    <>
      <Header 
        filters={null}
        onFiltersChange={null}
        minPrice={0}
        maxPrice={10000}
        comparingOffers={null}
        onEnterComparison={null}
        sortBy={null}
        sortOrder={null}
        onSortChange={null}
      />
      <ComparisonView
        offers={comparisonOffersList}
        onStatusChange={handleStatusChange}
        onBack={handleExitComparison}
      />
    </>
  )
}

export default Compare

