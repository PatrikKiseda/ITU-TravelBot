// Author:             Patrik Kišeda ( xkised00 )
// File:                   ComparisonView.jsx
// Functionality :   side-by-side comparison view with synchronized scrolling

import React, { useState, useEffect, useRef } from 'react'
import ComparisonCard from './ComparisonCard'
import './ComparisonView.css'

function ComparisonView({ offers, onStatusChange, onBack }) {
	// manages two-column comparison layout with skip functionality
  const [leftIndex, setLeftIndex] = useState(0)
  const [rightIndex, setRightIndex] = useState(1)
  const [leftSkipped, setLeftSkipped] = useState(new Set())
  const [rightSkipped, setRightSkipped] = useState(new Set())
  const leftScrollRef = useRef(null)
  const rightScrollRef = useRef(null)

  // calculates comparison colors based on relative difference
  const calculateComparisonColors = (leftValue, rightValue, baseColor = '#2a2a2a') => {
    if (leftValue === rightValue) {
      return { leftColor: baseColor, rightColor: baseColor }
    }
    
    const higher = Math.max(leftValue, rightValue)
    const lower = Math.min(leftValue, rightValue)
    const average = (higher + lower) / 2
    const diffFromAvg = average - lower
    const relativeDiff = Math.min(diffFromAvg / average, 0.4) // Cap at 30%
    
    const greenShift = Math.round(relativeDiff * 76) // Max 76 (30% of 255)
    const redShift = Math.round(relativeDiff * 76)
    
    const leftColor = leftValue <= rightValue 
      ? `rgb(${42 + greenShift}, ${42 + greenShift}, ${42})` // Green tint
      : `rgb(${42 + redShift}, ${42}, ${42})` // Red tint
      
    const rightColor = rightValue <= leftValue
      ? `rgb(${42 + greenShift}, ${42 + greenShift}, ${42})` // Green tint
      : `rgb(${42 + redShift}, ${42}, ${42})` // Red tint
      
    return { leftColor, rightColor }
  }

  // calculates trip length in days
  const calculateTripLength = (offer) => {
    if (!offer.date_from || !offer.date_to) return 0
    const from = new Date(offer.date_from)
    const to = new Date(offer.date_to)
    const diffTime = Math.abs(to - from)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // calculates total price
  const calculateTotalPrice = (offer) => {
    return (offer.price_housing || 0) + (offer.price_food || 0) + (offer.price_transport_amount || 0)
  }

  // calculates comparison data for both offers
  const calculateComparisonData = () => {
    const leftOffer = offers[leftIndex] || null
    const rightOffer = offers[rightIndex] || null
    
    if (!leftOffer || !rightOffer) {
      return null
    }

    const leftTripLength = calculateTripLength(leftOffer)
    const rightTripLength = calculateTripLength(rightOffer)
    const leftTotalPrice = calculateTotalPrice(leftOffer)
    const rightTotalPrice = calculateTotalPrice(rightOffer)
    const leftPricePerDay = leftTripLength > 0 ? leftTotalPrice / leftTripLength : 0
    const rightPricePerDay = rightTripLength > 0 ? rightTotalPrice / rightTripLength : 0

    const leftTransport = leftOffer.price_transport_amount || 0
    const rightTransport = rightOffer.price_transport_amount || 0
    const leftHousing = leftOffer.price_housing || 0
    const rightHousing = rightOffer.price_housing || 0
    const leftFood = leftOffer.price_food || 0
    const rightFood = rightOffer.price_food || 0

    // for trip length, longer is better (invert the comparison)
    const tripLengthColors = calculateComparisonColors(rightTripLength, leftTripLength)

    return {
      tripLength: tripLengthColors,
      totalPrice: calculateComparisonColors(leftTotalPrice, rightTotalPrice),
      pricePerDay: calculateComparisonColors(leftPricePerDay, rightPricePerDay),
      transport: calculateComparisonColors(leftTransport, rightTransport),
      housing: calculateComparisonColors(leftHousing, rightHousing),
      food: calculateComparisonColors(leftFood, rightFood),
      leftTripLength,
      rightTripLength,
      leftTotalPrice,
      rightTotalPrice,
      leftPricePerDay,
      rightPricePerDay,
      leftTransport,
      rightTransport,
      leftHousing,
      rightHousing,
      leftFood,
      rightFood,
    }
  }

  const comparisonData = calculateComparisonData()

  const handleLeftScroll = (e) => {
	// synchronizes right column scroll with left
    if (rightScrollRef.current) {
      rightScrollRef.current.scrollTop = e.target.scrollTop
    }
  }

  const handleRightScroll = (e) => {
    if (leftScrollRef.current) {
      leftScrollRef.current.scrollTop = e.target.scrollTop
    }
  }

  const getNextAvailableIndex = (currentIndex, otherIndex, skippedSet) => {
	// finds next available offer index for skipping
    // Try next index
    let nextIndex = currentIndex + 1
    while (nextIndex < offers.length) {
      if (nextIndex !== otherIndex && !skippedSet.has(nextIndex)) {
        return nextIndex
      }
      nextIndex++
    }
    // If no next, try previously skipped
    if (skippedSet.size > 0) {
      const skippedArray = Array.from(skippedSet).sort((a, b) => a - b)
      for (const idx of skippedArray) {
        if (idx !== otherIndex && idx < offers.length) {
          return idx
        }
      }
    }
    // If still nothing, try any available
    for (let i = 0; i < offers.length; i++) {
      if (i !== otherIndex && i !== currentIndex) {
        return i
      }
    }
    return currentIndex // Stay at current if no other option
  }

  const handleLeftSkip = (newIndex) => {
    if (newIndex < offers.length && newIndex !== rightIndex) {
      setLeftSkipped(prev => new Set(prev).add(leftIndex))
      setLeftIndex(newIndex)
    } else {
      const nextIndex = getNextAvailableIndex(leftIndex, rightIndex, leftSkipped)
      if (nextIndex !== leftIndex) {
        setLeftSkipped(prev => new Set(prev).add(leftIndex))
        setLeftIndex(nextIndex)
      }
    }
  }

  const handleRightSkip = (newIndex) => {
    if (newIndex < offers.length && newIndex !== leftIndex) {
      setRightSkipped(prev => new Set(prev).add(rightIndex))
      setRightIndex(newIndex)
    } else {
      const nextIndex = getNextAvailableIndex(rightIndex, leftIndex, rightSkipped)
      if (nextIndex !== rightIndex) {
        setRightSkipped(prev => new Set(prev).add(rightIndex))
        setRightIndex(nextIndex)
      }
    }
  }

  // Handle when an offer is removed (favorited/rejected)
  useEffect(() => {
    // If left offer was removed, find next available
    if (leftIndex >= offers.length) {
      const nextIndex = offers.findIndex((_, idx) => idx !== rightIndex)
      if (nextIndex !== -1) {
        setLeftIndex(nextIndex)
      }
    }
    // If right offer was removed, find next available
    if (rightIndex >= offers.length) {
      const nextIndex = offers.findIndex((_, idx) => idx !== leftIndex)
      if (nextIndex !== -1) {
        setRightIndex(nextIndex)
      }
    }
  }, [offers.length, leftIndex, rightIndex])

  const leftOffer = offers[leftIndex] || null
  const rightOffer = offers[rightIndex] || null

  if (offers.length < 2) {
    return (
      <div className="comparison-view">
        <div className="comparison-header">
          <h1>Comparison</h1>
        </div>
        <div className="comparison-error">
          <p>You need at least 2 offers to compare. Please select more offers.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="comparison-view">
      <div className="comparison-header">
        <h1>Comparison</h1>
      </div>
      
      <div className="comparison-container">
        <div 
          className="comparison-column left-column"
          ref={leftScrollRef}
          onScroll={handleLeftScroll}
        >
          {leftOffer ? (
            <ComparisonCard
              offer={leftOffer}
              onStatusChange={onStatusChange}
              onSkip={handleLeftSkip}
              comparisonOffers={offers}
              currentIndex={leftIndex}
              comparisonData={comparisonData}
              isLeft={true}
            />
          ) : (
            <div className="comparison-empty">No more offers to compare</div>
          )}
        </div>

        <div 
          className="comparison-column right-column"
          ref={rightScrollRef}
          onScroll={handleRightScroll}
        >
          {rightOffer ? (
            <ComparisonCard
              offer={rightOffer}
              onStatusChange={onStatusChange}
              onSkip={handleRightSkip}
              comparisonOffers={offers}
              currentIndex={rightIndex}
              comparisonData={comparisonData}
              isLeft={false}
            />
          ) : (
            <div className="comparison-empty">No more offers to compare</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ComparisonView

