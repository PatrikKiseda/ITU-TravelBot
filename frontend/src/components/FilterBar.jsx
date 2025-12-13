import React, { useState, useEffect } from 'react'
import './FilterBar.css'

function FilterBar({ filters, onFiltersChange, minPrice = 0, maxPrice = 10000, sortBy, sortOrder, onSortChange }) {
  const [localFilters, setLocalFilters] = useState(filters)
  const [priceRange, setPriceRange] = useState(filters.priceRange || [minPrice, maxPrice])

  useEffect(() => {
    setLocalFilters(filters)
    setPriceRange(filters.priceRange || [minPrice, maxPrice])
  }, [filters, minPrice, maxPrice])

  const handleStatusToggle = (status) => {
    const newStatusFilter = localFilters.statusFilter === status ? null : status
    const newFilters = { ...localFilters, statusFilter: newStatusFilter }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handlePriceChange = (min, max) => {
    const newRange = [min, max]
    setPriceRange(newRange)
    const newFilters = { ...localFilters, priceRange: newRange }
    setLocalFilters(newFilters)
    // Debounced - will be handled by parent
    onFiltersChange(newFilters)
  }

  const handleSeasonChange = (season) => {
    const newFilters = { ...localFilters, season: season || null }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleTypeChange = (type) => {
    const newFilters = { ...localFilters, typeOfStay: type || null }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleOriginChange = (origin) => {
    const newFilters = { ...localFilters, origin: origin || null }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleDestinationChange = (destination) => {
    const newFilters = { ...localFilters, destination: destination || null }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  // Season icons (SVG)
  const SeasonIcon = ({ season, active, onClick }) => {
    const icons = {
      summer: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/><path d="M12 2v4M12 18v4M22 12h-4M6 12H2M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83M19.07 19.07l-2.83-2.83M7.76 7.76l-2.83-2.83" stroke="currentColor" strokeWidth="2"/></svg>,
      winter: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v20M8 6l4-4 4 4M8 18l4 4 4-4M4 12h4M16 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
      spring: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 2v4M12 18v4M22 12h-4M6 12H2" stroke="currentColor" strokeWidth="2"/></svg>,
      autumn: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L8 8l4 6-4 6 4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 2l4 6-4 6 4 6-4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    }
    return (
      <button
        className={`season-icon-btn ${active ? 'active' : ''}`}
        onClick={onClick}
        title={season.charAt(0).toUpperCase() + season.slice(1)}
      >
        {icons[season]}
      </button>
    )
  }

  // Type icons
  const TypeIcon = ({ type, active, onClick }) => {
    const icons = {
      beach: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21h18M5 17l2-2M19 17l-2-2M12 3v14" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="8" r="2" fill="currentColor"/></svg>,
      sightseeing: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      camping: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21l9-18 9 18H3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2"/></svg>
    }
    return (
      <button
        className={`type-icon-btn ${active ? 'active' : ''}`}
        onClick={onClick}
        title={type.charAt(0).toUpperCase() + type.slice(1)}
      >
        {icons[type]}
      </button>
    )
  }

  return (
    <div className="filter-bar">
      <div className="filter-row filter-row-1">
        <div className="filter-section status-toggles">
          <label className="filter-label">Filter by status:</label>
          <div className="status-toggle-group">
            <button
              className={`status-toggle ${localFilters.statusFilter === 'accepted' ? 'active' : ''}`}
              onClick={() => handleStatusToggle('accepted')}
            >
              Favorites
            </button>
            <button
              className={`status-toggle ${localFilters.statusFilter === 'undecided' ? 'active' : ''}`}
              onClick={() => handleStatusToggle('undecided')}
            >
              Undecided
            </button>
            <button
              className={`status-toggle ${localFilters.statusFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => handleStatusToggle('rejected')}
            >
              Rejected
            </button>
          </div>
        </div>

        <div className="filter-section season-section">
          <label className="filter-label">Season:</label>
          <div className="icon-buttons-group">
            <SeasonIcon season="summer" active={localFilters.season === 'summer'} onClick={() => handleSeasonChange(localFilters.season === 'summer' ? null : 'summer')} />
            <SeasonIcon season="winter" active={localFilters.season === 'winter'} onClick={() => handleSeasonChange(localFilters.season === 'winter' ? null : 'winter')} />
            <SeasonIcon season="spring" active={localFilters.season === 'spring'} onClick={() => handleSeasonChange(localFilters.season === 'spring' ? null : 'spring')} />
            <SeasonIcon season="autumn" active={localFilters.season === 'autumn'} onClick={() => handleSeasonChange(localFilters.season === 'autumn' ? null : 'autumn')} />
          </div>
        </div>

        <div className="filter-section type-section">
          <label className="filter-label">Type of stay:</label>
          <div className="icon-buttons-group">
            <TypeIcon type="beach" active={localFilters.typeOfStay === 'beach'} onClick={() => handleTypeChange(localFilters.typeOfStay === 'beach' ? null : 'beach')} />
            <TypeIcon type="sightseeing" active={localFilters.typeOfStay === 'sightseeing'} onClick={() => handleTypeChange(localFilters.typeOfStay === 'sightseeing' ? null : 'sightseeing')} />
            <TypeIcon type="camping" active={localFilters.typeOfStay === 'camping'} onClick={() => handleTypeChange(localFilters.typeOfStay === 'camping' ? null : 'camping')} />
          </div>
        </div>

        <div className="filter-section">
          <label className="filter-label">Origin:</label>
          <input
            type="text"
            value={localFilters.origin || ''}
            onChange={(e) => handleOriginChange(e.target.value)}
            placeholder="Where from?"
            className="filter-input"
          />
        </div>

        <div className="filter-section">
          <label className="filter-label">Destination:</label>
          <input
            type="text"
            value={localFilters.destination || ''}
            onChange={(e) => handleDestinationChange(e.target.value)}
            placeholder="Where to?"
            className="filter-input"
          />
        </div>

        <div className="filter-section sort-section">
          <label className="filter-label">Sort by:</label>
          <div className="sort-controls-inline">
            <select
              value={sortBy || 'status'}
              onChange={(e) => onSortChange && onSortChange(e.target.value)}
              className="filter-select"
            >
              <option value="status">Status</option>
              <option value="price">Price</option>
              <option value="date">Date</option>
            </select>
            {sortBy === 'price' && (
              <button
                className="sort-order-toggle-small"
                onClick={() => onSortChange && onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                title={sortOrder === 'asc' ? 'Low to High' : 'High to Low'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="filter-row filter-row-2">
        <div className="filter-section price-range-section">
          <label className="filter-label">Price range: ${priceRange[0]} - ${priceRange[1]}</label>
          <div className="price-slider-container">
            <div className="price-slider-track"></div>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceRange[0]}
              onChange={(e) => {
                const newMin = Math.min(parseInt(e.target.value), priceRange[1])
                handlePriceChange(newMin, priceRange[1])
              }}
              onInput={(e) => {
                const newMin = Math.min(parseInt(e.target.value), priceRange[1])
                handlePriceChange(newMin, priceRange[1])
              }}
              className="price-slider price-slider-min"
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => {
                const newMax = Math.max(parseInt(e.target.value), priceRange[0])
                handlePriceChange(priceRange[0], newMax)
              }}
              onInput={(e) => {
                const newMax = Math.max(parseInt(e.target.value), priceRange[0])
                handlePriceChange(priceRange[0], newMax)
              }}
              className="price-slider price-slider-max"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterBar

