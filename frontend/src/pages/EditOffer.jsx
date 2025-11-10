import "./EditOffer.css"
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import {fetchOfferById, updateOffer, fetchAvailableOffers} from "../services/api.js";

function EditOffer({}) {
    // const { id } = useParams()
    // const [onChange, setOnChange] = useState([false])
    //
    // const handleChange = async () => {
    //     try {
    //         setOnChange(true)
    //         const data = await fetchAvailableOffers()
    //     } catch (err) {
    //         console.error('[Explore] Error loading offers:', err)
    //     }
    // }

    const { id } = useParams()
    const navigate = useNavigate()

    const [offer, setOffer] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    /* Загружаем оффер по id */
    useEffect(() => {
        loadOffer()

    }, [])

    const loadOffer = async () => {
        try {
            setLoading(true)
            console.log('Explore')
            const data = await fetchOfferById(id)
            console.log('Explore2222')
            setOffer(data)
        } catch (err) {
            setError("Failed to load offer")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }
    console.log('Explore333333')

    /* Обновление полей */
    const handleChange = (e) => {
        const { name, value } = e.target
        setOffer(prev => ({ ...prev, [name]: value }))
    }

    /* Сохранение изменений */
    const handleSave = async () => {
        try {
            setSaving(true)
            await updateOffer(id, offer)
            navigate("/admin")  // вернуться назад (изменяй путь сам)
        } catch (err) {
            console.error(err)
            setError("Failed to save changes")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div>Loading...</div>
    console.log('Explore4444444')
    if (!offer) return <div>No offer found</div>

    return (
        <div className="edit-offer-page">

            <h1>Edit Offer: {offer.destination_name}</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div className="edit-form">

                {/* Пример текстовых полей (добавь все нужные) */}

                <label>Destination name</label>
                <input
                    name="destination_name"
                    value={offer.destination_name}
                    onChange={handleChange}
                />

                <label>Country</label>
                <input
                    name="country"
                    value={offer.country}
                    onChange={handleChange}
                />

                <label>City</label>
                <input
                    name="city"
                    value={offer.city || ""}
                    onChange={handleChange}
                />

                <label>Origin</label>
                <input
                    name="origin"
                    value={offer.origin}
                    onChange={handleChange}
                />

                <label>Destination (where to)</label>
                <input
                    name="destination_where_to"
                    value={offer.destination_where_to}
                    onChange={handleChange}
                />

                <label>Short description</label>
                <textarea
                    name="short_description"
                    value={offer.short_description}
                    onChange={handleChange}
                />

                <label>Extended description</label>
                <textarea
                    name="extended_description"
                    value={offer.extended_description || ""}
                    onChange={handleChange}
                />

                {/*<label>Type of stay (JSON array)</label>*/}
                {/*<input*/}
                {/*    name="type_of_stay"*/}
                {/*    value={offer.type_of_stay || ""}*/}
                {/*    onChange={handleChange}*/}
                {/*/>*/}

                <label>Price housing</label>
                <input
                    name="price_housing"
                    type="number"
                    value={offer.price_housing}
                    onChange={handleChange}
                />

                <label>Price food</label>
                <input
                    name="price_food"
                    type="number"
                    value={offer.price_food}
                    onChange={handleChange}
                />

                <label>Transport cost</label>
                <input
                    name="price_transport_amount"
                    type="number"
                    value={offer.price_transport_amount || ""}
                    onChange={handleChange}
                />

                <label>Image URL</label>
                <input
                    name="image_url"
                    value={offer.image_url || ""}
                    onChange={handleChange}
                />

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="save-button"
                >
                    {saving ? "Saving..." : "Save changes"}
                </button>

            </div>
        </div>
    )
}

export default EditOffer