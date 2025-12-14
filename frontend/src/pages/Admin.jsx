import "./Admin.css"
import React, { useState, useEffect } from 'react'
import {fetchAvailableOffers} from "../services/api.js";
import { useNavigate, useLocation } from 'react-router-dom'
import AdminOfferCard from "../components/AdminOfferCard.jsx"
import CreateOfferCard from "../components/CreateOfferCard.jsx"
function Admin() {
    const navigate = useNavigate()
    const [offers, setOffers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [onDelete, setOnDelete] = useState(false)
    const [expandedOfferId, setExpandedOfferId] = useState(null)

    useEffect(() => {
        setOnDelete(false)
        console.log("test")
        loadOffers()
    }, [onDelete])

    const loadOffers = async () => {
        try {
            setLoading(true)
            console.log('[Explore] Loading available offers')
            const data = await fetchAvailableOffers()
            setOffers(data || [])
            console.log('[Explore] Received offers:', data)
            setError(null)
        } catch (err) {
            console.error('[Explore] Error loading offers:', err)
            setError('Failed to load destinations: ' + (err.message || 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    const handleCreateOffer = async (newOffer) => {
        await loadOffers() // Перезагружаем список
    }

    const handleLogoClick = () => {
        navigate('/explore')
    }

    const handleToggleExpand = (offerId) => {
        setExpandedOfferId(prevId => prevId === offerId ? null : offerId)
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
                            // Fallback to text if image doesn't exist
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'block'
                        }}
                    />
                    <span className="logo-text-fallback" style={{display: 'none'}}>Travelbot</span>
                </button>
            </div>
            <div className="admin-page-content">
                {/* Карточка создания */}
                <CreateOfferCard onCreate={handleCreateOffer}/>

                {/* Список карточек */}
                <div className="admin-page-offers-list">
                    {offers.length === 0 ? (
                        <div className="empty-state">
                            <h2>No destinations yet</h2>
                            <p>Create your first destination using the card above!</p>
                        </div>
                    ) : (
                        <div className="offers-list">
                            {offers.map((offer) => (
                                <AdminOfferCard
                                    key={offer.id}
                                    setOnDelete={setOnDelete}
                                    offer={offer}
                                    isExpanded={expandedOfferId === offer.id}
                                    onToggleExpand={() => handleToggleExpand(offer.id)}
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