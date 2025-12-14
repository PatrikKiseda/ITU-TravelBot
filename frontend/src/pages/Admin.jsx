// pages/Admin.jsx
import "./Admin.css"
import React, { useState, useEffect } from 'react'
import { fetchAvailableOffers } from "../services/api.js"
import { useNavigate } from 'react-router-dom'
import AdminOfferCard from "../components/AdminOfferCard.jsx"
import CreateOfferCard from "../components/CreateOfferCard.jsx"
import SimpleSearch from "../components/SimpleSearch.jsx"

function Admin() {
    const navigate = useNavigate()
    const [offers, setOffers] = useState([])
    const [filteredOffers, setFilteredOffers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [onDelete, setOnDelete] = useState(false)
    const [expandedOfferId, setExpandedOfferId] = useState(null)

    useEffect(() => {
        setOnDelete(false)
        loadOffers()
    }, [onDelete])

    const loadOffers = async () => {
        try {
            setLoading(true)
            const data = await fetchAvailableOffers()
            setOffers(data || [])
            setFilteredOffers(data || [])
            setError(null)
        } catch (err) {
            console.error('[Admin] Error loading offers:', err)
            setError('Failed to load destinations: ' + (err.message || 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    const handleCreateOffer = async (newOffer) => {
        await loadOffers()
    }

    const handleLogoClick = () => {
        navigate('/explore')
    }

    const handleToggleExpand = (offerId) => {
        setExpandedOfferId(prevId => prevId === offerId ? null : offerId)
    }

    const handleSearch = ({ destination, origin }) => {
        let filtered = [...offers]

        if (destination) {
            filtered = filtered.filter(offer =>
                offer.destination_name.toLowerCase().includes(destination.toLowerCase())
            )
        }

        if (origin) {
            filtered = filtered.filter(offer =>
                offer.origin.toLowerCase().includes(origin.toLowerCase())
            )
        }

        setFilteredOffers(filtered)
    }

    const handleOfferUpdate = (updatedOffer) => {
        // Update the offer in the offers array to keep it in sync
        setOffers(prevOffers => 
            prevOffers.map(offer => 
                offer.id === updatedOffer.id ? updatedOffer : offer
            )
        )
        // Also update filtered offers if this offer is currently visible
        setFilteredOffers(prevFiltered => 
            prevFiltered.map(offer => 
                offer.id === updatedOffer.id ? updatedOffer : offer
            )
        )
    }

    if (loading) {
        return <div className="admin-page"><div className="loading-state">Loading...</div></div>
    }

    if (error) {
        return <div className="admin-page"><div className="error-state">{error}</div></div>
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <button className="logo-button" onClick={handleLogoClick} aria-label="Go to Explore">
                    <img
                        src="/travelbot-logo.png"
                        alt="Travelbot"
                        className="logo-image"
                        onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'block'
                        }}
                    />
                    <span className="logo-text-fallback" style={{display: 'none'}}>Travelbot</span>
                </button>

                {/* Поиск */}
                <SimpleSearch onSearch={handleSearch} />
            </div>

            <div className="admin-page-content">
                {/* Карточка создания */}
                <CreateOfferCard onCreate={handleCreateOffer}/>

                {/* Список карточек */}
                <div className="admin-page-offers-list">
                    {filteredOffers.length === 0 ? (
                        <div className="empty-state">
                            <h2>{offers.length === 0 ? 'No destinations yet' : 'No destinations found'}</h2>
                            <p>{offers.length === 0
                                ? 'Create your first destination using the card above!'
                                : 'Try adjusting your search terms'}
                            </p>
                        </div>
                    ) : (
                        <div className="offers-list">
                            {filteredOffers.map((offer) => (
                                <AdminOfferCard
                                    key={offer.id}
                                    setOnDelete={setOnDelete}
                                    offer={offer}
                                    isExpanded={expandedOfferId === offer.id}
                                    onToggleExpand={() => handleToggleExpand(offer.id)}
                                    onOfferUpdate={handleOfferUpdate}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Admin