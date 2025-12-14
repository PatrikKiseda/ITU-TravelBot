// Created by Shaposhnik Bogdan (xshapo04)
import {useState, useEffect} from 'react'
import {
    deleteOfferPermanent,
    fetchTags,
    updateOffer,
    addTagToOffer,
    removeTagFromOffer,
    fetchAllAvailableTags
} from '../services/api'

export function useAdminOfferCard(offer, setOnDelete, isExpanded, onToggleExpand, showConfirm) {
    //State
    const [loading, setLoading] = useState(false)
    const [tags, setTags] = useState([])
    const [highlightTags, setHighlightTags] = useState([])
    const [whyVisitTags, setWhyVisitTags] = useState([])
    const [considerTags, setConsiderTags] = useState([])
    const [localOffer, setLocalOffer] = useState(offer)
    const [availableTags, setAvailableTags] = useState([])
    const [isEditingImage, setIsEditingImage] = useState(false)
    const [imageUrl, setImageUrl] = useState(localOffer.image_url || '')
    const [dateFrom, setDateFrom] = useState(localOffer.date_from || '')
    const [dateTo, setDateTo] = useState(localOffer.date_to || '')

    //Load data on mount
    useEffect(() => {
        loadTags()
        loadAvailableTags()
    }, [])

    useEffect(() => {
        setDateFrom(localOffer.date_from || '')
        setDateTo(localOffer.date_to || '')
    }, [localOffer.date_from, localOffer.date_to])

    // Filter tags by type
    useEffect(() => {
        setHighlightTags(tags.filter(t => t.type === "highlights"))
        setWhyVisitTags(tags.filter(t => t.type === "why_visit"))
        setConsiderTags(tags.filter(t => t.type === "things_to_consider"))
    }, [tags])

    //Data loading functions
    const loadTags = async () => {
        try {
            const tagData = await fetchTags(offer.id)
            setTags(tagData)
        } catch (err) {
            console.error('[AdminOfferCard] Error loading tags:', err)
        }
    }

    const loadAvailableTags = async () => {
        try {
            const allTags = await fetchAllAvailableTags()
            setAvailableTags(allTags)
        } catch (err) {
            console.error('[AdminOfferCard] Error loading available tags:', err)
        }
    }

    // Field update handler
    const handleUpdateField = async (field, value) => {
        try {
            const updates = { [field]: value }
            await updateOffer(localOffer.id, updates)
            setLocalOffer(prev => ({ ...prev, ...updates }))
        } catch (err) {
            console.error('[AdminOfferCard] Error updating field:', err)
            throw err
        }
    }

    // Image handlers
    const handleSaveImageUrl = async () => {
        try {
            await updateOffer(localOffer.id, { image_url: imageUrl })
            setLocalOffer(prev => ({ ...prev, image_url: imageUrl }))
            setIsEditingImage(false)
        } catch (err) {
            console.error('[AdminOfferCard] Failed to update image:', err)
        }
    }

    const handleDateFromChange = (value) => {
        setDateFrom(value)
    }

    const handleDateToChange = (value) => {
        setDateTo(value)
    }

    const handleDateFromBlur = async () => {
        if (dateFrom !== localOffer.date_from) {
            try {
                await updateOffer(localOffer.id, { date_from: dateFrom })
                setLocalOffer(prev => ({ ...prev, date_from: dateFrom }))
            } catch (err) {
                console.error('[AdminOfferCard] Failed to update date_from:', err)
                setDateFrom(localOffer.date_from || '') // Roll back in case of error
            }
        }
    }

    const handleDateToBlur = async () => {
        if (dateTo !== localOffer.date_to) {
            // Validation: date_to must be after date_from
            if (dateFrom && dateTo && new Date(dateTo) <= new Date(dateFrom)) {
                alert('End date must be after start date')
                setDateTo(localOffer.date_to || '')
                return
            }

            try {
                await updateOffer(localOffer.id, { date_to: dateTo })
                setLocalOffer(prev => ({ ...prev, date_to: dateTo }))
            } catch (err) {
                console.error('[AdminOfferCard] Failed to update date_to:', err)
                setDateTo(localOffer.date_to || '') // Roll back in case of error
            }
        }
    }

    const handleCancelImageEdit = () => {
        setImageUrl(localOffer.image_url || '')
        setIsEditingImage(false)
    }

    const toggleImageEdit = () => {
        setIsEditingImage(!isEditingImage)
    }

    // Tag handlers
    const handleAddTag = async (tag) => {
        try {
            await addTagToOffer(localOffer.id, tag.id)
            setTags(prev => [...prev, tag])
        } catch (err) {
            console.error('[AdminOfferCard] Failed to add tag:', err)
        }
    }

    const handleRemoveTag = async (tagId) => {
        try {
            await removeTagFromOffer(localOffer.id, tagId)
            setTags(prev => prev.filter(t => t.id !== tagId))
        } catch (err) {
            console.error('[AdminOfferCard] Failed to remove tag:', err)
        }
    }

    // Delete handler
    const handleDelete = async () => {
        const confirmed = await showConfirm({
            title: 'Delete Destination',
            message: `Are you sure you want to delete "${localOffer.destination_name}"?\n\nThis action cannot be undone.`,
            confirmButtonStyle: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        })

        if (!confirmed) {
            return
        }

        try {
            await deleteOfferPermanent(offer.id)
            setOnDelete(true)
        } catch (err) {
            console.error('[AdminOfferCard] Failed to delete:', err)
        }
    }

    // Expand/collapse handler
    const toggleExpanded = () => {
        onToggleExpand()
    }

    // Calculate price range
    const calculatePriceRange = () => {
        const housing = localOffer.price_housing || 0
        const food = localOffer.price_food || 0
        const transport = localOffer.price_transport_amount || 0
        const minPrice = housing + food + transport
        const maxPrice = Math.round(minPrice + minPrice/5.0)
        return { min: minPrice, max: maxPrice }
    }

    const priceRange = calculatePriceRange()

    return {
        // State
        loading,
        expanded: isExpanded,
        localOffer,
        availableTags,
        isEditingImage,
        imageUrl,
        setImageUrl,
        highlightTags,
        whyVisitTags,
        considerTags,
        priceRange,
        dateFrom,
        dateTo,

        // Handlers
        handleUpdateField,
        handleSaveImageUrl,
        handleCancelImageEdit,
        toggleImageEdit,
        handleAddTag,
        handleRemoveTag,
        handleDelete,
        toggleExpanded,
        handleDateFromChange,
        handleDateToChange,
        handleDateFromBlur,
        handleDateToBlur
    }
}