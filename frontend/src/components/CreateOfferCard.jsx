// Created by Shaposhnik Bogdan (xshapo04)
import React from 'react'
import { useCreateOffer } from '../controllers/CreateOfferCardController.js'
import EditableField from './EditableField'
import TagSearchSelector from './TagSearchSelector'
import { useModal } from '../controllers/ModalController.js'
import Modal from './Modal'
import './CreateOfferCard.css'

function CreateOfferCard({ onCreate }) {

    const { modalState, showConfirm, showAlert } = useModal()
    const {
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
        priceRange,
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

    } = useCreateOffer(onCreate, showConfirm, showAlert)

    // Placeholder
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

    // Creation form
    return (
        <div>
            <div className="card-creating-container">
                <div className={`admin-offer-card creating ${Object.keys(errors).length > 0 ? 'has-errors' : ''}`}>
                    <div className="card-content">
                        {/* Image */}
                        <div className="card-image-container">
                            <div className="card-image">
                                {formData.image_url ? (
                                    <img src={formData.image_url} alt={formData.destination_name} />
                                ) : (
                                    <div className="image-placeholder">Click ✏️ to add image</div>
                                )}
                                <button className="edit-image-btn" onClick={toggleImageEdit} title="Edit image URL">
                                    ✏️
                                </button>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="card-info">
                            <div className="places-list">
                                <div className="edit-section">
                                    <h2>Where:</h2>
                                    <h2 className={`destination-name ${errors.destination_name ? 'field-error' : ''}`}>
                                        <EditableField
                                            value={formData.destination_name}
                                            onSave={(val) => handleUpdateField('destination_name', val)}
                                            className="dest-edit-field"
                                        />
                                    </h2>
                                </div>
                                <div className="edit-section">
                                    <h2>From:</h2>
                                    <h2 className={`from-name ${errors.origin ? 'field-error' : ''}`}>
                                        <EditableField
                                            value={formData.origin}
                                            onSave={(val) => handleUpdateField('origin', val)}
                                            className="dest-edit-field"
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
                                            className="price-edit-field"
                                        />
                                    </div>
                                    <div className="price-component">
                                        <p>🍴</p>
                                        <EditableField
                                            value={formData.price_food || 0}
                                            onSave={(val) => handleUpdateField('price_food', Number(val))}
                                            type="number"
                                            prefix="$"
                                            className="price-edit-field"
                                        />
                                    </div>
                                    <div className="price-component">
                                        <p>✈️</p>
                                        <EditableField
                                            value={formData.price_transport_amount || 0}
                                            onSave={(val) => handleUpdateField('price_transport_amount', Number(val))}
                                            type="number"
                                            prefix="$"
                                            className="price-edit-field"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="admin-offer-card-actions">
                            <div className="create-actions">
                                <button onClick={handleCancel} className="cancel-create-btn" title="Cancel">
                                    ✕
                                </button>
                                <button onClick={handleSave} className="save-create-btn" disabled={isSaving} title="Save destination">
                                    {isSaving ? '💾' : '✓'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Image URL Editor */}
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

                    {/* Expand/Collapse */}
                    <div className="expand-container">
                        <div className="expand-row" onClick={toggleExpanded}>
                            {expanded ? "▲" : "▼"}
                        </div>
                    </div>

                    {/* Expanded Content */}
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
            <Modal
                isOpen={modalState.isOpen}
                title={modalState.title}
                message={modalState.message}
                type={modalState.type}
                confirmButtonStyle={modalState.confirmButtonStyle}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
                onConfirm={modalState.onConfirm}
                onCancel={modalState.onCancel}
            />
        </div>
    )
}

export default CreateOfferCard