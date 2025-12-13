import "./Admin.css"
import React, { useState, useEffect } from 'react'
import {createOffer, fetchAvailableOffers} from "../services/api.js";
import AdminOfferCard from "../components/AdminOfferCard.jsx"
import CreateOfferCard from "../components/CreateOfferCard.jsx"
function Admin() {
    const [offers, setOffers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [onDelete, setOnDelete] = useState(false)

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

    if (loading) {
        return <div className="admin-page"><div className="loading-state">Loading...</div></div>
    }

    if (error) {
        return <div className="admin-page"><div className="error-state">{error}</div></div>
    }


    return (
        <div className="admin-page">
            {/*<div className="admin-page-header">*/}
            {/*    <h1>Manage Destinations</h1>*/}
            {/*</div>*/}

            <div className="admin-page-content">
                {/* Карточка создания */}
                <CreateOfferCard onCreate={handleCreateOffer} />

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