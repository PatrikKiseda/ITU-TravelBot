import React, {useEffect, useState} from 'react'
import {
    deleteOfferPermanent,
    fetchAvailableOffers,
    fetchExpandedOffer,
    fetchTags, updateOffer,
    addTagToOffer,
    removeTagFromOffer, fetchAllAvailableTags
} from '../services/api'
import './AdminOfferCard.css'
import '../controllers/AdminOfferCardController.js'
import { useNavigate, useLocation } from 'react-router-dom'
import EditableField from "./EditableField.jsx"
import TagSearchSelector from "./TagSearchSelector"
function AdminOfferCard({offer,setOnDelete}) {
    const navigate = useNavigate()
    const location = useLocation()



    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [tags,setTags] = useState([])
    const [highlightTags,setHighlightTags] = useState([])
    const [whyVisitTags,setWhyVisitTags] = useState([])
    const [considerTags,setConsiderTags] = useState([])
    const [localOffer, setLocalOffer] = useState(offer)
    const [availableTags, setAvailableTags] = useState([])
    const [isEditingImage, setIsEditingImage] = useState(false)
    const [imageUrl, setImageUrl] = useState(localOffer.image_url || '')



    useEffect(() =>  {
        loadTags()
        loadAvailableTags()
        },[])

    useEffect(() => {
        loadAvailableTags()
        setHighlightTags(tags.filter(t => t.type === "highlights"));
        setWhyVisitTags(tags.filter(t => t.type === "why_visit"));
        setConsiderTags(tags.filter(t => t.type === "things_to_consider"));
    }, [tags])

    const handleSaveImageUrl = async () => {
        try {
            await updateOffer(localOffer.id, { image_url: imageUrl })
            setLocalOffer(prev => ({ ...prev, image_url: imageUrl }))
            setIsEditingImage(false)
        } catch (err) {
            console.error('Failed to update image:', err)
        }
    }

    const handleCancelImageEdit = () => {
        setImageUrl(localOffer.image_url || '')
        setIsEditingImage(false)
    }

    const loadTags = async () => {
        try {
            const tagData = await fetchTags(offer.id);
            console.log('Tagi:',tagData)
            setTags(tagData)
            console.log('Tags:',tags)
            console.log('Dictionary:',dict)
        } catch (err) {
            console.error('[Explore] Error loading tags:', err)
        }
    }

    const loadAvailableTags = async () => {
        try {
            const allTags = await fetchAllAvailableTags()
            setAvailableTags(allTags)
        } catch (err) {
            console.error('Error loading available tags:', err)
        }
    }

    const handleAddTag = async (tag) => {
        try {
            await addTagToOffer(localOffer.id, tag.id)
            setTags(prev => [...prev, tag])
        } catch (err) {
            console.error('Failed to add tag:', err)
        }
    }

    const handleRemoveTag = async (tagId) => {
        try {
            await removeTagFromOffer(localOffer.id, tagId)
            setTags(prev => prev.filter(t => t.id !== tagId))
        } catch (err) {
            console.error('Failed to remove tag:', err)
        }
    }

    const calculatePriceRange = () => {
        const housing = localOffer.price_housing || 0
        const food = localOffer.price_food || 0
        const transport = localOffer.price_transport_amount || 0
        const minPrice = housing + food + transport
        const maxPrice = minPrice + 200 // Rough estimate for range
        return { min: minPrice, max: maxPrice }
    }

    const handleCardExpand = async () => {
        if (!expanded) {
            setExpanded(true)
        } else {
            setExpanded(false)
        }
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

    // Обработчики сохранения
    const handleUpdateField = async (field, value) => {
        const updates = { [field]: value }
        await updateOffer(localOffer.id, updates)
        setLocalOffer(prev => ({ ...prev, ...updates }))
    }

    const handleUpdateTag = async (tagId, newText) => {
        await updateTag(tagId, { tag_name: newText })
        setTags(prev => prev.map(t =>
            t.id === tagId ? { ...t, tag_name: newText } : t
        ))
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

    useEffect(() =>  {
        calculatePriceRange()
    },[localOffer])

    const priceRange = calculatePriceRange()
    const housing = offer.price_housing || 0
    const food = offer.price_food || 0
    const transport = offer.price_transport_amount || 0

    return (
        <div className="admin-offer-card">
            <div className="card-content">
                {/* Картинка */}
                <div className="card-image-container">
                    <div className="card-image">
                        {localOffer.image_url ? (
                            <img src={localOffer.image_url} alt={localOffer.destination_name}/>
                        ) : (
                            <div className="image-placeholder">No Image</div>
                        )}
                        <button
                            className="edit-image-btn"
                            onClick={() => setIsEditingImage(!isEditingImage)}
                            title="Edit image URL"
                        >
                            ✏️
                        </button>
                    </div>
                </div>

                {/* Информация */}
                <div className="card-info">
                    <div className="places-list editable-thing">
                        <div className="edit-section">
                            <h2>
                                Where:
                            </h2>
                            <h2 className="destination-name">
                                <EditableField
                                    value={localOffer.destination_name}
                                    onSave={(val) => handleUpdateField('destination_name', val)}
                                />
                            </h2>
                        </div>
                        <div className="edit-section">
                            <h2>
                                From:
                            </h2>
                            <h2 className="from-name">
                                <EditableField
                                    value={localOffer.origin}
                                    onSave={(val) => handleUpdateField('origin', val)}
                                />
                            </h2>
                        </div>
                    </div>
                    <div className="price-section">
                        <div className="price-component">
                        Price: ${priceRange.min} - ${priceRange.max}
                        </div>
                        <div className="additional-prices">
                            <div className="price-component">
                                <p>
                                    🏠
                                </p>
                                <EditableField
                                value={localOffer.price_housing || 0}
                                onSave={(val) => handleUpdateField('price_housing', Number(val))}
                                type="number"
                                prefix="$"
                            />
                            </div>
                            <div className="price-component">
                                <p>
                                    🍴
                                </p>
                                 <EditableField
                                value={localOffer.price_food || 0}
                                onSave={(val) => handleUpdateField('price_food', Number(val))}
                                type="number"
                                prefix="$"
                            />
                            </div>
                            <div className="price-component">
                                <p>
                                    ✈️
                                </p>
                                <EditableField
                                value={localOffer.price_transport_amount || 0}
                                onSave={(val) => handleUpdateField('price_transport_amount', Number(val))}
                                type="number"
                                prefix="$"
                            />
                            </div>
                        </div>
                    </div>


                </div>
                <div className={"admin-offer-card-actions"}>
                    <div className="delete-button">
                        <button onClick={handleDeleteClick}>
                            🗑️
                        </button>
                    </div>
                </div>


            </div>

            {isEditingImage && (
                <div className="image-url-editor">
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Enter image URL"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveImageUrl()
                            if (e.key === 'Escape') handleCancelImageEdit()
                        }}
                    />
                    <div className="image-url-actions">
                        <button onClick={handleSaveImageUrl} className="save-btn">
                            ✓ Save
                        </button>
                        <button onClick={handleCancelImageEdit} className="cancel-btn">
                            ✗ Cancel
                        </button>
                    </div>
                </div>
            )}
            <div className="expand-container">
                <div className="expand-row" onClick={handleCardExpand}>
                    {loading ? "…" : expanded ? "▲" : "▼"}
                </div>
            </div>
            <div className="card-expandable">
                {expanded && (
                    <div className="expanded-content">
                        <div className="description">
                            <h3>
                                Decription:
                            </h3>
                            <EditableField
                                value={localOffer.short_description}
                                onSave={(val) => handleUpdateField('short_description', val)}
                                type="textarea"
                            />
                        </div>
                        <div className="tags-lists">
                            {/* Highlights */}
                            <div className="tag-type">
                                <div className="tag-list-header">
                                    <p>Highlights:</p>
                                </div>
                                <TagSearchSelector
                                    availableTags={availableTags}
                                    selectedTags={highlightTags}
                                    onAddTag={handleAddTag}
                                    onRemoveTag={handleRemoveTag}
                                    tagType="highlights"
                                    offerId={localOffer.id}
                                />
                            </div>

                            {/* Why Visit */}
                            <div className="tag-type">
                                <div className="tag-list-header">
                                    <p>Why visit:</p>
                                </div>
                                <TagSearchSelector
                                    availableTags={availableTags}
                                    selectedTags={whyVisitTags}
                                    onAddTag={handleAddTag}
                                    onRemoveTag={handleRemoveTag}
                                    tagType="why_visit"
                                    offerId={localOffer.id}
                                />
                            </div>

                            {/* Things to Consider */}
                            <div className="tag-type">
                                <div className="tag-list-header">
                                    <p>Things to consider:</p>
                                </div>
                                <TagSearchSelector
                                    availableTags={availableTags}
                                    selectedTags={considerTags}
                                    onAddTag={handleAddTag}
                                    onRemoveTag={handleRemoveTag}
                                    tagType="things_to_consider"
                                    offerId={localOffer.id}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}

export default AdminOfferCard