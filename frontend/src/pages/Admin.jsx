import "./Admin.css"
import React, { useState, useEffect } from 'react'
import {fetchAvailableOffers} from "../services/api.js";
import AdminOfferCard from "../components/AdminOfferCard.jsx";
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
            console.log('[Explore] Received offers:', data)
            setOffers(data || [])
            setError(null)
        } catch (err) {
            console.error('[Explore] Error loading offers:', err)
            setError('Failed to load destinations: ' + (err.message || 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="admin-page">
            <div className="admin-page-header">
            </div>
            <div className={"admin-page-add-button"}>

            </div>
            <div className={"admin-page-offers-list"}>
                {offers.length === 0 ? (
                    <div className="empty-state">
                        <h2>No destinations available</h2>
                        <p>Check back later or create some offers as a travel agent!</p>
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
    )
}

export default Admin