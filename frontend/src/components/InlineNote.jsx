// Author:             Patrik Kišeda ( xkised00 )
// File:                   InlineNote.jsx
// Functionality :   inline note component with auto-save functionality

import React, { useState, useEffect, useRef } from 'react'
import './InlineNote.css'

function InlineNote({ offerId, initialNote, onSave, onExpandChange }) {
	// manages inline note editing with debounced auto-save
  const [note, setNote] = useState(initialNote || '')
  const [expanded, setExpanded] = useState(false)
  const textareaRef = useRef(null)
  const noteContainerRef = useRef(null)

  useEffect(() => {
    setNote(initialNote || '')
  }, [initialNote])

  useEffect(() => {
    if (onExpandChange) {
      onExpandChange(expanded)
    }
  }, [expanded, onExpandChange])

  // Handle clicks outside note area
  useEffect(() => {
    if (!expanded) return

    const handleClickOutside = (e) => {
      if (noteContainerRef.current && !noteContainerRef.current.contains(e.target)) {
        // Click is outside note area - deactivate
        setExpanded(false)
        // Save if changed
        if (note !== (initialNote || '')) {
          onSave(offerId, note)
        }
      }
    }

    // Use setTimeout to avoid immediate trigger from the click that opened it
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeout)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [expanded, note, initialNote, offerId, onSave])

  // Debounced auto-save
  useEffect(() => {
    if (note === (initialNote || '')) return
    
    const timeout = setTimeout(() => {
      onSave(offerId, note)
    }, 500)

    return () => clearTimeout(timeout)
  }, [note, offerId, initialNote, onSave])

  const handleClick = (e) => {
    e.stopPropagation() // Prevent card expansion
    setExpanded(true)
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }, 0)
  }

  const handleBlur = () => {
    // Don't close on blur - let click-outside handle it
    // This prevents closing when clicking inside the textarea
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      setExpanded(false)
      if (note !== (initialNote || '')) {
        onSave(offerId, note)
      }
    }
  }

  if (expanded) {
    return (
      <div className="inline-note expanded" ref={noteContainerRef} onClick={(e) => e.stopPropagation()}>
        <textarea
          ref={textareaRef}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Add a note... (Press Enter to save)"
          className="note-textarea"
          rows={3}
        />
      </div>
    )
  }

  return (
    <div className="inline-note" ref={noteContainerRef} onClick={handleClick}>
      <div className="note-preview">
        {note || <span className="note-placeholder">Click to add note...</span>}
      </div>
    </div>
  )
}

export default InlineNote

