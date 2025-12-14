// components/SimpleSearch.jsx
import React, { useState } from 'react'
import './SimpleSearch.css'

function SimpleSearch({ onSearch }) {
    const [destination, setDestination] = useState('')
    const [origin, setOrigin] = useState('')

    const handleSearch = () => {
        onSearch({ destination, origin })
    }

    const handleReset = () => {
        setDestination('')
        setOrigin('')
        onSearch({ destination: '', origin: '' })
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    // Обработчик потери фокуса - автоматический поиск
    const handleBlur = () => {
        handleSearch()
    }

    // Проверяем, есть ли текст в полях
    const hasSearchText = destination.trim() !== '' || origin.trim() !== ''

    return (
        <div className="simple-search">
            <div className="search-fields">
                <input
                    type="text"
                    placeholder="🛫 From (e.g., New York)"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onBlur={handleBlur}
                    className="search-input"
                />
                <input
                    type="text"
                    placeholder="📍 To (e.g., Paris)"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onBlur={handleBlur}
                    className="search-input"
                />
            </div>
            <div className="search-actions">
                <button onClick={handleSearch} className="search-btn">
                    🔍 Search
                </button>
                {hasSearchText && (
                    <button onClick={handleReset} className="reset-btn">
                        ✕
                    </button>
                )}
            </div>
        </div>
    )
}

export default SimpleSearch