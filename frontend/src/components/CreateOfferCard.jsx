// components/CreateOfferCard.jsx
import React, { useState, useEffect } from 'react'
import { createOffer, fetchAllAvailableTags, addTagToOffer } from '../services/api'
import EditableField from './EditableField'
import TagSearchSelector from './TagSearchSelector'
import './CreateOfferCard.css' // Используем те же стили!

// Вспомогательные функции для дат
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

function CreateOfferCard({ onCreate }) {
    const [isCreating, setIsCreating] = useState(false)
    const [expanded, setExpanded] = useState(true) // Сразу развернута
    const [isSaving, setIsSaving] = useState(false)
    const [availableTags, setAvailableTags] = useState([])
    const [isEditingImage, setIsEditingImage] = useState(false)

    // Временные теги (до сохранения в БД)
    const [tempHighlightTags, setTempHighlightTags] = useState([])
    const [tempWhyVisitTags, setTempWhyVisitTags] = useState([])
    const [tempConsiderTags, setTempConsiderTags] = useState([])

    const [formData, setFormData] = useState(() => {
        const today = new Date()
        const twoWeeksLater = addDays(today, 14)

        return {
            destination_name: 'New Destination',
            country: '',
            city: '',
            destination_where_to: '',
            capacity_available: 20,
            capacity_total: 20,
            date_from: formatDate(today),
            date_to: formatDate(twoWeeksLater),
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
    })

    const [imageUrl, setImageUrl] = useState('')
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (isCreating) {
            loadAvailableTags()
        }
    }, [isCreating])

    const loadAvailableTags = async () => {
        try {
            const allTags = await fetchAllAvailableTags()
            setAvailableTags(allTags)
        } catch (err) {
            console.error('Error loading available tags:', err)
        }
    }

    const handleStartCreating = () => {
        setIsCreating(true)
        setExpanded(true)
    }

    const handleCancel = () => {
        if (window.confirm('Discard this new destination?')) {
            setIsCreating(false)
            setExpanded(true)
            setTempHighlightTags([])
            setTempWhyVisitTags([])
            setTempConsiderTags([])

            const today = new Date()
            const twoWeeksLater = addDays(today, 14)

            setFormData({
                destination_name: 'New Destination',
                country: 'Country',
                city: '',
                destination_where_to: 'Location',
                capacity_available: 20,
                capacity_total: 20,
                date_from: formatDate(today),
                date_to: formatDate(twoWeeksLater),
                season: 'summer',
                origin: 'Your City',
                short_description: 'Add description here...',
                extended_description: '',
                price_housing: 0,
                price_food: 0,
                price_transport_mode: 'plane',
                price_transport_amount: 0,
                image_url: '',
            })
            setImageUrl('')
            setErrors({})
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.destination_name || formData.destination_name === 'New Destination') {
            newErrors.destination_name = 'Please set destination name'
        }

        if (!formData.origin || formData.origin === 'Your City') {
            newErrors.origin = 'Please set origin'
        }

        if (!formData.short_description || formData.short_description === 'Add description here...') {
            newErrors.short_description = 'Please add description'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) {
            alert('Please fill in all required fields (highlighted in red)')
            return
        }

        if (!window.confirm('Create this destination?')) {
            return
        }

        setIsSaving(true)
        try {
            // Создаем оффер
            const newOffer = await createOffer(formData)

            // Добавляем теги к созданному офферу
            const allTempTags = [...tempHighlightTags, ...tempWhyVisitTags, ...tempConsiderTags]
            for (const tag of allTempTags) {
                await addTagToOffer(newOffer.id, tag.id)
            }

            // Сообщаем родителю о создании
            if (onCreate) {
                await onCreate(newOffer)
            }

            // Сбрасываем форму
            setIsCreating(false)
            setTempHighlightTags([])
            setTempWhyVisitTags([])
            setTempConsiderTags([])

            alert('Destination created successfully!')
        } catch (err) {
            console.error('Failed to create offer:', err)
            alert('Failed to create destination. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleUpdateField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Убираем ошибку при изменении
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const handleSaveImageUrl = () => {
        setFormData(prev => ({ ...prev, image_url: imageUrl }))
        setIsEditingImage(false)
    }

    const handleCancelImageEdit = () => {
        setImageUrl(formData.image_url || '')
        setIsEditingImage(false)
    }

    // Временное добавление тегов (не в БД)
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

    const calculatePriceRange = () => {
        const housing = formData.price_housing || 0
        const food = formData.price_food || 0
        const transport = formData.price_transport_amount || 0
        const minPrice = housing + food + transport
        const maxPrice = minPrice + 200
        return { min: minPrice, max: maxPrice }
    }

    const priceRange = calculatePriceRange()

    // Плейсхолдер - заблюренная карточка с +
    if (!isCreating) {
        return (
            <div className="create-placeholder-container">
                <div className="admin-offer-card create-placeholder" onClick={handleStartCreating}>
                    <div className="placeholder-content">
                        <div className="plus-icon">+</div>
                        <p>Create New Destination</p>
                    </div>
                </div>
            </div>
        )
    }

    // Карточка в режиме создания (выглядит как обычная, но с особыми стилями)
    return (
        <div className="card-creating-container">
        <div className={`admin-offer-card creating ${Object.keys(errors).length > 0 ? 'has-errors' : ''}`}>
            <div className="card-content">
                {/* Картинка */}
                <div className="card-image-container">
                    <div className="card-image">
                        {formData.image_url ? (
                            <img src={formData.image_url} alt={formData.destination_name}/>
                        ) : (
                            <div className="image-placeholder">Click ✏️ to add image</div>
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
                    <div className="places-list">
                        <div className="edit-section">
                            <h2>Where:</h2>
                            <h2 className={`destination-name ${errors.destination_name ? 'field-error' : ''}`}>
                                <EditableField
                                    value={formData.destination_name}
                                    onSave={(val) => handleUpdateField('destination_name', val)}
                                />
                            </h2>
                        </div>
                        <div className="edit-section">
                            <h2>From:</h2>
                            <h2 className={`from-name ${errors.origin ? 'field-error' : ''}`}>
                                <EditableField
                                    value={formData.origin}
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
                                <p>🏠</p>
                                <EditableField
                                    value={formData.price_housing || 0}
                                    onSave={(val) => handleUpdateField('price_housing', Number(val))}
                                    type="number"
                                    prefix="$"
                                />
                            </div>
                            <div className="price-component">
                                <p>🍴</p>
                                <EditableField
                                    value={formData.price_food || 0}
                                    onSave={(val) => handleUpdateField('price_food', Number(val))}
                                    type="number"
                                    prefix="$"
                                />
                            </div>
                            <div className="price-component">
                                <p>✈️</p>
                                <EditableField
                                    value={formData.price_transport_amount || 0}
                                    onSave={(val) => handleUpdateField('price_transport_amount', Number(val))}
                                    type="number"
                                    prefix="$"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Кнопки действий */}
                <div className="admin-offer-card-actions">
                    <div className="create-actions">
                        <button onClick={handleCancel} className="cancel-create-btn" title="Cancel">
                            ✕
                        </button>
                        <button
                            onClick={handleSave}
                            className="save-create-btn"
                            disabled={isSaving}
                            title="Save destination"
                        >
                            {isSaving ? '💾' : '✓'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Редактор изображения */}
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

            {/* Стрелка раскрытия */}
            <div className="expand-container">
                <div className="expand-row" onClick={() => setExpanded(!expanded)}>
                    {expanded ? "▲" : "▼"}
                </div>
            </div>

            {/* Расширенный контент */}
            {expanded && (
                <div className="card-expandable">
                    <div className="expanded-content">
                        <div className={`description ${errors.short_description ? 'field-error' : ''}`}>
                            <h3>Description:</h3>
                            <EditableField
                                value={formData.short_description}
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
                                    selectedTags={tempHighlightTags}
                                    onAddTag={handleAddTempTag}
                                    onRemoveTag={handleRemoveTempTag}
                                    tagType="highlights"
                                />
                            </div>

                            {/* Why Visit */}
                            <div className="tag-type">
                                <div className="tag-list-header">
                                    <p>Why visit:</p>
                                </div>
                                <TagSearchSelector
                                    availableTags={availableTags}
                                    selectedTags={tempWhyVisitTags}
                                    onAddTag={handleAddTempTag}
                                    onRemoveTag={handleRemoveTempTag}
                                    tagType="why_visit"
                                />
                            </div>

                            {/* Things to Consider */}
                            <div className="tag-type">
                                <div className="tag-list-header">
                                    <p>Things to consider:</p>
                                </div>
                                <TagSearchSelector
                                    availableTags={availableTags}
                                    selectedTags={tempConsiderTags}
                                    onAddTag={handleAddTempTag}
                                    onRemoveTag={handleRemoveTempTag}
                                    tagType="things_to_consider"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
    )
}

export default CreateOfferCard