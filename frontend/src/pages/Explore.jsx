import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import ExploreOfferCard from '../components/ExploreOfferCard'
import Header from '../components/Header'
import { fetchAllOffersWithStatus, updateOfferStatus } from '../services/api'
import './Explore.css'

function Explore({ filters: externalFilters, onFiltersChange, onPriceRangeChange, comparingOffers, setComparingOffers }) {
  const navigate = useNavigate()
  const [offers, setOffers] = useState([])
  const [displayedOffers, setDisplayedOffers] = useState([])
  const [allOffersForBounds, setAllOffersForBounds] = useState([]) // All offers without price filtering for slider bounds
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(externalFilters || {
    statusFilter: null,
    priceRange: [0, 10000],
    season: null,
    typeOfStay: null,
    origin: null,
    destination: null,
  })
  const [sortBy, setSortBy] = useState('status')
  const [sortOrder, setSortOrder] = useState('asc')
  const [isFiltering, setIsFiltering] = useState(false)

  const handleSortChange = (newSort, newOrder) => {
    if (newOrder) {
      setSortOrder(newOrder)
    } else if (sortBy === newSort) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSort)
      setSortOrder('asc')
    }
  }

  const handleCompareToggle = (offerId, isSelected) => {
    setComparingOffers(prev => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(offerId)
      } else {
        newSet.delete(offerId)
      }
      return newSet
    })
  }

  const handleEnterComparison = () => {
    navigate('/compare')
  }

  const handleExitComparison = () => {
    navigate('/explore')
  }

  // Initial load - load all offers for bounds, then filtered offers
  useEffect(() => {
    loadAllOffersForBounds()
    loadOffers(true)
  }, [])

  // Load all offers without price filtering to get true min/max bounds
  const loadAllOffersForBounds = async () => {
    try {
      const filtersWithoutPrice = { ...filters }
      delete filtersWithoutPrice.priceRange
      const data = await fetchAllOffersWithStatus({
        ...filtersWithoutPrice,
        statusFilter: filters.statusFilter ? filters.statusFilter.toUpperCase() : null,
        sort: sortBy,
        order: sortOrder,
      })
      setAllOffersForBounds(data || [])
    } catch (err) {
      console.error('[Explore] Error loading all offers for bounds:', err)
    }
  }

  // Debounced filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        loadOffers(false)
        // Reload bounds if non-price filters changed
        if (filters.origin || filters.destination || filters.season || filters.typeOfStay || filters.statusFilter) {
          loadAllOffersForBounds()
        }
      }
    }, 400) // 400ms debounce

    return () => clearTimeout(timeoutId)
  }, [filters, sortBy, sortOrder])

  const loadOffers = async (isInitial = false) => {
    try {
      if (isInitial) {
      setLoading(true)
      } else {
        setIsFiltering(true)
      }
      console.log('[Explore] Loading offers with filters:', filters)
      
      const data = await fetchAllOffersWithStatus({
        ...filters,
        priceMin: filters.priceRange[0],
        priceMax: filters.priceRange[1],
        statusFilter: filters.statusFilter ? filters.statusFilter.toUpperCase() : null,
        sort: sortBy,
        order: sortOrder,
      })
      console.log('[Explore] Received offers:', data)
      setOffers(data || [])
      setDisplayedOffers(data || [])
      setError(null)
    } catch (err) {
      console.error('[Explore] Error loading offers:', err)
      setError('Failed to load destinations: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
      setIsFiltering(false)
    }
  }

  const handleStatusChange = async (offerId, newStatus) => {
    try {
      console.log('[Explore] Updating status:', offerId, newStatus)
      await updateOfferStatus(offerId, newStatus)
      // Update local state
      setOffers(prevOffers => 
        prevOffers.map(offer => 
          offer.id === offerId ? { ...offer, status: newStatus } : offer
        )
      )
      setDisplayedOffers(prevOffers => 
        prevOffers.map(offer => 
          offer.id === offerId ? { ...offer, status: newStatus } : offer
        )
      )
      // Remove from comparison if status changed
      if (comparingOffers.has(offerId)) {
        setComparingOffers(prev => {
          const newSet = new Set(prev)
          newSet.delete(offerId)
          return newSet
        })
      }
    } catch (err) {
      console.error('[Explore] Error updating status:', err)
      alert('Failed to update status: ' + (err.message || 'Unknown error'))
    }
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }

  // Sync with external filters
  useEffect(() => {
    if (externalFilters) {
      setFilters(externalFilters)
    }
  }, [externalFilters])

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const offerId = draggableId.replace('offer-', '')
    
    // Determine new status based on destination droppable
    let newStatus
    if (destination.droppableId === 'accepted') {
      newStatus = 'ACCEPTED'
    } else if (destination.droppableId === 'rejected') {
      newStatus = 'REJECTED'
    } else {
      newStatus = 'UNDECIDED'
    }

    await handleStatusChange(offerId, newStatus)
  }

  // Sort offers by price within each status group
  const sortOffersByPrice = (offersList) => {
    if (sortBy !== 'price') return offersList
    
    return [...offersList].sort((a, b) => {
      const priceA = (a.price_housing || 0) + (a.price_food || 0) + (a.price_transport_amount || 0)
      const priceB = (b.price_housing || 0) + (b.price_food || 0) + (b.price_transport_amount || 0)
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA
    })
  }

  // Group offers by status (use displayedOffers for current view)
  const acceptedOffers = sortOffersByPrice(displayedOffers.filter(o => o.status === 'ACCEPTED'))
  const undecidedOffers = sortOffersByPrice(displayedOffers.filter(o => !o.status || o.status === 'UNDECIDED'))
  const rejectedOffers = sortOffersByPrice(displayedOffers.filter(o => o.status === 'REJECTED'))


  // Calculate actual min/max prices from ALL offers WITHOUT price filtering (for slider bounds)
  const allPricesForBounds = allOffersForBounds.length > 0 
    ? allOffersForBounds.map(o => (o.price_housing || 0) + (o.price_food || 0) + (o.price_transport_amount || 0))
    : []
  
  const actualMinPrice = allPricesForBounds.length > 0 ? Math.min(...allPricesForBounds) : 0
  const actualMaxPrice = allPricesForBounds.length > 0 ? Math.max(...allPricesForBounds) : 10000

  // Update price range if it's still at default and notify parent
  useEffect(() => {
    if (actualMaxPrice > 0 && offers.length > 0) {
      if (onPriceRangeChange) {
        onPriceRangeChange({ min: actualMinPrice, max: actualMaxPrice })
      }
      // Only update if still at default
      if (filters.priceRange[1] === 10000 || filters.priceRange[1] > actualMaxPrice) {
        setFilters(prev => ({
          ...prev,
          priceRange: [actualMinPrice, actualMaxPrice]
        }))
      }
    }
  }, [actualMinPrice, actualMaxPrice, offers.length, onPriceRangeChange])

  if (loading) {
    return <div className="explore-page"><div className="loading">Loading destinations...</div></div>
  }

  if (error) {
    return <div className="explore-page"><div className="error">{error}</div></div>
  }


  return (
    <>
      <Header 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        minPrice={actualMinPrice}
        maxPrice={actualMaxPrice}
        comparingOffers={comparingOffers}
        onEnterComparison={handleEnterComparison}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />
      {isFiltering && (
        <div className="filtering-indicator">Filtering...</div>
      )}
    <div className="explore-page">
      <div className="explore-content">
          {displayedOffers.length === 0 && !isFiltering ? (
          <div className="empty-state">
            <h2>No destinations available</h2>
            <p>Check back later or create some offers as a travel agent!</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="offers-container">
              <Droppable droppableId="accepted">
                {(provided, snapshot) => (
                  <div 
                    className={`offer-group ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h3 className="group-header">Favorites ({acceptedOffers.length})</h3>
                    <div className="offers-list">
                      {acceptedOffers.map((offer, index) => (
                        <Draggable key={offer.id} draggableId={`offer-${offer.id}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.8 : 1,
                              }}
                            >
                              <ExploreOfferCard
                                offer={offer}
                                onStatusChange={handleStatusChange}
                                onCompareToggle={handleCompareToggle}
                                isComparing={comparingOffers.has(offer.id)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
              
              <Droppable droppableId="undecided">
                {(provided, snapshot) => (
                  <div 
                    className={`offer-group ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h3 className="group-header">Undecided ({undecidedOffers.length})</h3>
                    <div className="offers-list">
                      {undecidedOffers.map((offer, index) => (
                        <Draggable key={offer.id} draggableId={`offer-${offer.id}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.8 : 1,
                              }}
                            >
                              <ExploreOfferCard
                                offer={offer}
                                onStatusChange={handleStatusChange}
                                onCompareToggle={handleCompareToggle}
                                isComparing={comparingOffers.has(offer.id)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
              
              <Droppable droppableId="rejected">
                {(provided, snapshot) => (
                  <div 
                    className={`offer-group ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h3 className="group-header">Rejected ({rejectedOffers.length})</h3>
          <div className="offers-list">
                      {rejectedOffers.map((offer, index) => (
                        <Draggable key={offer.id} draggableId={`offer-${offer.id}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.8 : 1,
                              }}
                            >
              <ExploreOfferCard
                offer={offer}
                                onStatusChange={handleStatusChange}
                                onCompareToggle={handleCompareToggle}
                                isComparing={comparingOffers.has(offer.id)}
              />
                            </div>
                          )}
                        </Draggable>
            ))}
                      {provided.placeholder}
                    </div>
          </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>
          )}
        </div>
      </div>
    </>
  )
}

export default Explore
