import React, { useState, useEffect, useRef } from 'react'
import ComparisonCard from './ComparisonCard'
import './ComparisonView.css'

function ComparisonView({ offers, onStatusChange, onBack }) {
  const [leftIndex, setLeftIndex] = useState(0)
  const [rightIndex, setRightIndex] = useState(1)
  const [leftSkipped, setLeftSkipped] = useState(new Set())
  const [rightSkipped, setRightSkipped] = useState(new Set())
  const leftScrollRef = useRef(null)
  const rightScrollRef = useRef(null)

  // Synchronized scrolling
  const handleLeftScroll = (e) => {
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

