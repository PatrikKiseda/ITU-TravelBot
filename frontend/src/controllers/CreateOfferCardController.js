import {useState, useEffect} from 'react'
import {createOffer, fetchAllAvailableTags, addTagToOffer} from '../services/api'

// Вспомогательные функции
const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const addDays = (date, days) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

const getInitialFormData = () => {
    const today = new Date()
    const twoWeeksLater = addDays(today, 14)

    return {
        destination_name: 'New Destination',
        country: '',
        city: '',
        destination_where_to: '',
        capacity_available: 20,
        capacity_total: 20,
        date_from: '',
        date_to: '',
        season: 'summer',
        origin: 'New Origin',
        short_description: 'Add description here...',
        extended_description: '',
        price_housing: 0,
        price_food: 0,
        price_transport_mode: 'plane',
        price_transport_amount: 0,
        image_url: '',
    }
}

export function useCreateOffer(onCreate, showConfirm, showAlert)  {
    // State
    const [isCreating, setIsCreating] = useState(false)
    const [expanded, setExpanded] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [availableTags, setAvailableTags] = useState([])
    const [isEditingImage, setIsEditingImage] = useState(false)
    const [formData, setFormData] = useState(getInitialFormData)
    const [imageUrl, setImageUrl] = useState('')
    const [errors, setErrors] = useState({})

    // Temporary tags
    const [tempHighlightTags, setTempHighlightTags] = useState([])
    const [tempWhyVisitTags, setTempWhyVisitTags] = useState([])
    const [tempConsiderTags, setTempConsiderTags] = useState([])

    // Load tags when creating starts
    useEffect(() => {
        if (isCreating) {
            loadAvailableTags()
        }
    }, [isCreating])

    // Load available tags
    const loadAvailableTags = async () => {
        try {
            const allTags = await fetchAllAvailableTags()
            setAvailableTags(allTags)
        } catch (err) {
            console.error('[CreateOffer] Error loading available tags:', err)
        }
    }

    // Start creating
    const handleStartCreating = () => {
        setIsCreating(true)
        setExpanded(true)
    }

    // Cancel creating
    const handleCancel = async () => {
        const confirmed = await showConfirm({
            title: 'Discard Changes',
            message: 'Are you sure you want to discard this new destination?',
            confirmButtonStyle: 'danger',
            confirmText: 'Discard',
            cancelText: 'Keep Editing'
        })

        if (confirmed) {
            resetForm()
        }
    }

    // Reset form
    const resetForm = () => {
        setIsCreating(false)
        setExpanded(true)
        setTempHighlightTags([])
        setTempWhyVisitTags([])
        setTempConsiderTags([])
        setFormData(getInitialFormData())
        setImageUrl('')
        setErrors({})
    }

    // Validate form
    const validateForm = () => {
        const newErrors = {}

        if (!formData.destination_name || formData.destination_name === 'New Destination') {
            newErrors.destination_name = 'Please set destination name'
        }

        if (!formData.origin || formData.origin === 'New Origin') {
            newErrors.origin = 'Please set origin'
        }

        if (!formData.short_description || formData.short_description === 'Add description here...') {
            newErrors.short_description = 'Please add description'
        }

        if (!formData.date_from) {
            newErrors.date_from = 'Please set start date'
        }

        if (!formData.date_to) {
            newErrors.date_to = 'Please set end date'
        }

        if (formData.date_from && formData.date_to) {
            const dateFrom = new Date(formData.date_from)
            const dateTo = new Date(formData.date_to)

            if (dateTo <= dateFrom) {
                newErrors.date_to = 'End date must be after start date'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Save offer
    const handleSave = async () => {
        if (!validateForm()) {
            await showAlert({
                title: 'Missing Information',
                message: 'Please fill in all required fields:',
                confirmButtonStyle: 'primary'
            })
            return
        }

        const confirmed = await showConfirm({
            title: 'Create Destination',
            message: 'Create this destination?',
            confirmButtonStyle: 'success',
            confirmText: 'Create',
            cancelText: 'Cancel'
        })

        if (!confirmed) {
            return
        }

        setIsSaving(true)
        try {
            const newOffer = await createOffer(formData)

            const allTempTags = [...tempHighlightTags, ...tempWhyVisitTags, ...tempConsiderTags]
            for (const tag of allTempTags) {
                await addTagToOffer(newOffer.id, tag.id)
            }

            if (onCreate) {
                await onCreate(newOffer)
            }

            resetForm()

            await showAlert({
                title: 'Success',
                message: 'Destination created successfully!',
                confirmButtonStyle: 'success'
            })
        } catch (err) {
            console.error('[CreateOffer] Failed to create offer:', err)
            await showAlert({
                title: 'Error',
                message: 'Failed to create destination. Please try again.',
                confirmButtonStyle: 'danger'
            })
        } finally {
            setIsSaving(false)
        }
    }

    // Update field
    const handleUpdateField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    // Image handlers
    const handleSaveImageUrl = () => {
        setFormData(prev => ({ ...prev, image_url: imageUrl }))
        setIsEditingImage(false)
    }

    const handleCancelImageEdit = () => {
        setImageUrl(formData.image_url || '')
        setIsEditingImage(false)
    }

    const toggleImageEdit = () => {
        setIsEditingImage(!isEditingImage)
    }

    // Tag handlers
    const handleAddTempTag = (tag) => {
        if (tag.type === 'highlights') {
            setTempHighlightTags(prev => [...prev, tag])
        } else if (tag.type === 'why_visit') {
            setTempWhyVisitTags(prev => [...prev, tag])
        } else if (tag.type === 'things_to_consider') {
            setTempConsiderTags(prev => [...prev, tag])
        }
    }

    const handleRemoveTempTag = (tagId) => {
        setTempHighlightTags(prev => prev.filter(t => t.id !== tagId))
        setTempWhyVisitTags(prev => prev.filter(t => t.id !== tagId))
        setTempConsiderTags(prev => prev.filter(t => t.id !== tagId))
    }

    // Toggle expanded
    const toggleExpanded = () => {
        setExpanded(!expanded)
    }

    // Calculate price range
    const calculatePriceRange = () => {
        const housing = formData.price_housing || 0
        const food = formData.price_food || 0
        const transport = formData.price_transport_amount || 0
        const minPrice = housing + food + transport
        const maxPrice = Math.round(minPrice + minPrice/5.0)
        return { min: minPrice, max: maxPrice }
    }

    return {
        // State
        isCreating,
        expanded,
        isSaving,
        availableTags,
        isEditingImage,
        formData,
        imageUrl,
        setImageUrl,
        errors,
        tempHighlightTags,
        tempWhyVisitTags,
        tempConsiderTags,
        priceRange: calculatePriceRange(),

        // Handlers
        handleStartCreating,
        handleCancel,
        handleSave,
        handleUpdateField,
        handleSaveImageUrl,
        handleCancelImageEdit,
        toggleImageEdit,
        handleAddTempTag,
        handleRemoveTempTag,
        toggleExpanded
    }
}