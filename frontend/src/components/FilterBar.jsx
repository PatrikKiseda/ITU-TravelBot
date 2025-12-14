// Author:             Patrik Kišeda ( xkised00 )
// File:                   FilterBar.jsx
// Functionality :   filter bar component with price range slider and filter controls

import React, { useState, useEffect } from 'react'
import './FilterBar.css'

function FilterBar({ filters, onFiltersChange, minPrice = 0, maxPrice = 10000, sortBy, sortOrder, onSortChange }) {
	// manages filter state and price range slider
  const [localFilters, setLocalFilters] = useState(filters)
  const [priceRange, setPriceRange] = useState(filters.priceRange || [minPrice, maxPrice])

  useEffect(() => {
    setLocalFilters(filters)
    const currentRange = filters.priceRange || [minPrice, maxPrice]
    // Only update if the current range is outside the new bounds, but don't force it to be within bounds
    // This allows users to set ranges that include prices currently filtered out
    // Only clamp if the range is completely invalid (min >= max)
    let clampedMin = currentRange[0]
    let clampedMax = currentRange[1]
    
    // Only fix if min >= max (invalid range)
    if (clampedMin >= clampedMax) {
      clampedMin = Math.min(currentRange[0], minPrice)
      clampedMax = Math.max(currentRange[1], maxPrice)
      // If still invalid, use bounds
      if (clampedMin >= clampedMax) {
        clampedMin = minPrice
        clampedMax = Math.max(minPrice + 1, maxPrice)
      }
    }
    
    const clampedRange = [clampedMin, clampedMax]
    setPriceRange(clampedRange)
  }, [filters, minPrice, maxPrice])

  const handleStatusToggle = (status) => {
	// toggles status filter
    const newStatusFilter = localFilters.statusFilter === status ? null : status
    const newFilters = { ...localFilters, statusFilter: newStatusFilter }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handlePriceChange = (min, max) => {
	// handles price range changes from slider
    // Round to integers and ensure min < max
    // Don't clamp to minPrice/maxPrice bounds - allow users to set ranges outside current filtered bounds
    const roundedMin = Math.round(min)
    const roundedMax = Math.round(max)
    if (roundedMin < roundedMax) {
      const newRange = [roundedMin, roundedMax]
      setPriceRange(newRange)
      const newFilters = { ...localFilters, priceRange: newRange }
      setLocalFilters(newFilters)
      // Debounced - will be handled by parent
      onFiltersChange(newFilters)
    }
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

  // season icons component
  // to replace icons: place svg/png files in frontend/public/icons/ directory
  // use naming convention: season-summer.svg, season-winter.svg, season-spring.svg, season-autumn.svg
  // replace inline svg with: <img src="/icons/season-summer.svg" alt="summer" />
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

  // type icons component
  // to replace icons: place svg/png files in frontend/public/icons/ directory
  // use naming convention: type-beach.svg, type-sightseeing.svg, type-camping.svg
  // replace inline svg with: <img src="/icons/type-beach.svg" alt="beach" />
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
          <div className="price-slider-wrapper">
            <div className="price-slider-bounds">
              <span className="price-bound-label price-bound-min">${minPrice}</span>
              <span className="price-bound-label price-bound-max">${maxPrice}</span>
            </div>
            <div 
              className="price-slider-container"
              onMouseDown={(e) => {
                // Only handle if clicking on track, not on sliders or handles
                if (e.target.classList.contains('price-slider-track') || e.target.classList.contains('price-slider-range')) {
                  e.stopPropagation()
                  const rect = e.currentTarget.getBoundingClientRect()
                  const percent = ((e.clientX - rect.left) / rect.width) * 100
                  const clickValue = minPrice + (percent / 100) * (maxPrice - minPrice)
                  
                  // Determine which slider to move based on which is closer
                  const minPercent = ((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100
                  const maxPercent = ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100
                  const clickPercent = percent
                  
                  const minHandle = e.currentTarget.querySelector('.price-slider-handle-min')
                  const maxHandle = e.currentTarget.querySelector('.price-slider-handle-max')
                  const minSlider = e.currentTarget.querySelector('.price-slider-min')
                  const maxSlider = e.currentTarget.querySelector('.price-slider-max')
                  
                  if (Math.abs(clickPercent - minPercent) < Math.abs(clickPercent - maxPercent)) {
                    // Closer to min, move min slider
                    if (clickValue < priceRange[1] && minSlider) {
                      minSlider.value = Math.max(minPrice, Math.min(clickValue, priceRange[1] - 1))
                      minSlider.dispatchEvent(new Event('input', { bubbles: true }))
                    }
                  } else {
                    // Closer to max, move max slider
                    if (clickValue > priceRange[0] && maxSlider) {
                      maxSlider.value = Math.min(maxPrice, Math.max(clickValue, priceRange[0] + 1))
                      maxSlider.dispatchEvent(new Event('input', { bubbles: true }))
                    }
                  }
                }
              }}
              onTouchStart={(e) => {
                if (e.target.classList.contains('price-slider-track') || e.target.classList.contains('price-slider-range')) {
                  e.stopPropagation()
                  if (e.touches[0]) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const percent = ((e.touches[0].clientX - rect.left) / rect.width) * 100
                    const clickValue = minPrice + (percent / 100) * (maxPrice - minPrice)
                    
                    const minPercent = ((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100
                    const maxPercent = ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100
                    const clickPercent = percent
                    
                    const minSlider = e.currentTarget.querySelector('.price-slider-min')
                    const maxSlider = e.currentTarget.querySelector('.price-slider-max')
                    
                    if (Math.abs(clickPercent - minPercent) < Math.abs(clickPercent - maxPercent)) {
                      if (clickValue < priceRange[1] && minSlider) {
                        minSlider.value = Math.max(minPrice, Math.min(clickValue, priceRange[1] - 1))
                        minSlider.dispatchEvent(new Event('input', { bubbles: true }))
                      }
                    } else {
                      if (clickValue > priceRange[0] && maxSlider) {
                        maxSlider.value = Math.min(maxPrice, Math.max(clickValue, priceRange[0] + 1))
                        maxSlider.dispatchEvent(new Event('input', { bubbles: true }))
                      }
                    }
                  }
                }
              }}
            >
              <div className="price-slider-track"></div>
              <div 
                className="price-slider-range"
                style={{
                  left: maxPrice > minPrice ? `${Math.max(0, Math.min(100, ((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100))}%` : '0%',
                  width: maxPrice > minPrice ? `${Math.max(0, Math.min(100, ((priceRange[1] - priceRange[0]) / (maxPrice - minPrice)) * 100))}%` : '100%'
                }}
              ></div>
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                value={priceRange[0]}
                onChange={(e) => {
                  const newMin = parseInt(e.target.value)
                  if (newMin < priceRange[1]) {
                    handlePriceChange(newMin, priceRange[1])
                  }
                }}
                onInput={(e) => {
                  const newMin = parseInt(e.target.value)
                  if (newMin < priceRange[1]) {
                    handlePriceChange(newMin, priceRange[1])
                  }
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                }}
                onPointerDown={(e) => {
                  e.stopPropagation()
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
                className="price-slider price-slider-min"
              />
              <div 
                className="price-slider-handle price-slider-handle-min"
                style={{
                  left: maxPrice > minPrice ? `${Math.max(0, Math.min(100, ((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100))}%` : '0%'
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  const slider = e.currentTarget.previousElementSibling
                  if (slider) {
                    slider.focus()
                    // Start drag operation
                    const startX = e.clientX
                    const startValue = priceRange[0] // Use current range value, not slider.value
                    const rect = slider.getBoundingClientRect()
                    const valueRange = maxPrice - minPrice
                    
                    const handleMouseMove = (moveEvent) => {
                      const deltaX = moveEvent.clientX - startX
                      const deltaPercent = (deltaX / rect.width) * 100
                      const deltaValue = (deltaPercent / 100) * valueRange
                      // Allow dragging below minPrice - don't clamp to minPrice, only ensure it's less than max
                      const newValue = Math.round(Math.min(priceRange[1] - 1, startValue + deltaValue))
                      if (newValue < priceRange[1]) {
                        handlePriceChange(newValue, priceRange[1])
                      }
                    }
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove)
                      document.removeEventListener('mouseup', handleMouseUp)
                    }
                    
                    document.addEventListener('mousemove', handleMouseMove)
                    document.addEventListener('mouseup', handleMouseUp)
                  }
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  const slider = e.currentTarget.previousElementSibling
                  if (slider && e.touches[0]) {
                    slider.focus()
                    const startX = e.touches[0].clientX
                    const startValue = priceRange[0] // Use current range value
                    const rect = slider.getBoundingClientRect()
                    const valueRange = maxPrice - minPrice
                    
                    const handleTouchMove = (moveEvent) => {
                      if (moveEvent.touches[0]) {
                        const deltaX = moveEvent.touches[0].clientX - startX
                        const deltaPercent = (deltaX / rect.width) * 100
                        const deltaValue = (deltaPercent / 100) * valueRange
                        // Allow dragging below minPrice - don't clamp to minPrice, only ensure it's less than max
                        const newValue = Math.round(Math.min(priceRange[1] - 1, startValue + deltaValue))
                        if (newValue < priceRange[1]) {
                          handlePriceChange(newValue, priceRange[1])
                        }
                      }
                    }
                    
                    const handleTouchEnd = () => {
                      document.removeEventListener('touchmove', handleTouchMove)
                      document.removeEventListener('touchend', handleTouchEnd)
                    }
                    
                    document.addEventListener('touchmove', handleTouchMove, { passive: false })
                    document.addEventListener('touchend', handleTouchEnd)
                  }
                }}
              >
                <img 
                  src="/slider-handle-min.png" 
                  alt="Min slider"
                  className="slider-handle-icon"
                  draggable="false"
                />
              </div>
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => {
                  const newMax = parseInt(e.target.value)
                  if (newMax > priceRange[0]) {
                    handlePriceChange(priceRange[0], newMax)
                  }
                }}
                onInput={(e) => {
                  const newMax = parseInt(e.target.value)
                  if (newMax > priceRange[0]) {
                    handlePriceChange(priceRange[0], newMax)
                  }
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                }}
                onPointerDown={(e) => {
                  e.stopPropagation()
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
                className="price-slider price-slider-max"
              />
              <div 
                className="price-slider-handle price-slider-handle-max"
                style={{
                  left: maxPrice > minPrice ? `${Math.max(0, Math.min(100, ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100))}%` : '100%'
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  const slider = e.currentTarget.previousElementSibling
                  if (slider) {
                    slider.focus()
                    // Start drag operation
                    const startX = e.clientX
                    const startValue = priceRange[1] // Use current range value
                    const rect = slider.getBoundingClientRect()
                    const valueRange = maxPrice - minPrice
                    
                    const handleMouseMove = (moveEvent) => {
                      const deltaX = moveEvent.clientX - startX
                      const deltaPercent = (deltaX / rect.width) * 100
                      const deltaValue = (deltaPercent / 100) * valueRange
                      // Allow dragging above maxPrice - don't clamp to maxPrice, only ensure it's greater than min
                      const newValue = Math.round(Math.max(priceRange[0] + 1, startValue + deltaValue))
                      if (newValue > priceRange[0]) {
                        handlePriceChange(priceRange[0], newValue)
                      }
                    }
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove)
                      document.removeEventListener('mouseup', handleMouseUp)
                    }
                    
                    document.addEventListener('mousemove', handleMouseMove)
                    document.addEventListener('mouseup', handleMouseUp)
                  }
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  const slider = e.currentTarget.previousElementSibling
                  if (slider && e.touches[0]) {
                    slider.focus()
                    const startX = e.touches[0].clientX
                    const startValue = priceRange[1] // Use current range value
                    const rect = slider.getBoundingClientRect()
                    const valueRange = maxPrice - minPrice
                    
                    const handleTouchMove = (moveEvent) => {
                      if (moveEvent.touches[0]) {
                        const deltaX = moveEvent.touches[0].clientX - startX
                        const deltaPercent = (deltaX / rect.width) * 100
                        const deltaValue = (deltaPercent / 100) * valueRange
                        // Allow dragging above maxPrice - don't clamp to maxPrice, only ensure it's greater than min
                        const newValue = Math.round(Math.max(priceRange[0] + 1, startValue + deltaValue))
                        if (newValue > priceRange[0]) {
                          handlePriceChange(priceRange[0], newValue)
                        }
                      }
                    }
                    
                    const handleTouchEnd = () => {
                      document.removeEventListener('touchmove', handleTouchMove)
                      document.removeEventListener('touchend', handleTouchEnd)
                    }
                    
                    document.addEventListener('touchmove', handleTouchMove, { passive: false })
                    document.addEventListener('touchend', handleTouchEnd)
                  }
                }}
              >
                <img 
                  src="/slider-handle-max.png" 
                  alt="Max slider"
                  className="slider-handle-icon"
                  draggable="false"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterBar

