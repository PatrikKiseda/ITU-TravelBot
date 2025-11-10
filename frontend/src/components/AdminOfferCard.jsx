import React, { useState } from 'react'
import {deleteOfferPermanent, fetchExpandedOffer} from '../services/api'
import './AdminOfferCard.css'
import '../controllers/AdminOfferCardController.js'
import { useNavigate, useLocation } from 'react-router-dom'
function AdminOfferCard({offer,setOnDelete}) {
    const navigate = useNavigate()
    const location = useLocation()

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)

    const calculatePriceRange = () => {
        const housing = offer.price_housing || 0
        const food = offer.price_food || 0
        const transport = offer.price_transport_amount || 0
        const minPrice = housing + food + transport
        const maxPrice = minPrice + 200 // Rough estimate for range
        return { min: minPrice, max: maxPrice }
    }
    const loadOffer = async () => {
        try {
            setLoading(true)
            const data = await fetchExpandedOffer(offer.id)
            setData(data)
        } catch (err) {
            console.error('Failed to expand offer:', err)
        } finally {
            setLoading(false)
        }
    }
    const handleDeleteClick = async () => {
        try {
            await deleteOfferPermanent(offer.id)
            setOnDelete(true)
        } catch (err) {
            console.error("Failed to delete:", err)
        }
    }


    const handleEditClick = () => {
        navigate(`/editOffer/${offer.id}`)
    }
    const priceRange = calculatePriceRange()
    const housing = offer.price_housing || 0
    const food = offer.price_food || 0
    const transport = offer.price_transport_amount || 0

    return (
        <div className="admin-offer-card">
            <div className="card-content">
                {/* Картинка */}
                <div className="card-image">
                    {offer.image_url ? (
                        <img src={offer.image_url} alt={offer.destination_name}/>
                    ) : (
                        <div className="image-placeholder">No Image</div>
                    )}
                </div>

                {/* Информация */}
                <div className="card-info">
                    <h2 className="destination-name">{offer.destination_name}</h2>
                    <div className="price-section">
                        <div className="price-component">
                            Price: ${priceRange.min} - ${priceRange.max}
                        </div>
                        <div className="price-component">
                            Housing: ${housing}
                        </div>
                        <div className="price-component">
                            Food: ${food}
                        </div>
                        <div className="price-component">
                            Transport: ${transport}
                        </div>
                    </div>

                    <div className="description">
                        <p>{offer.short_description}</p>
                    </div>
                </div>
                <div className={"admin-offer-card-actions"}>
                    <div className="edit-button">
                        <button onClick={handleEditClick}>
                                Edit Offer
                        </button>
                    </div>
                    <div className="delete-button">
                        <button onClick={handleDeleteClick}>
                                Delete Offer
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default AdminOfferCard