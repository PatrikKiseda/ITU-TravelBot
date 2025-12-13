// Created by Shaposhnik Bogdan (xshapo04)
import React from 'react'
import { useAdminOfferCard } from '../controllers/AdminOfferCardController.js'
import EditableField from './EditableField'
import TagSearchSelector from './TagSearchSelector'
import { useModal } from '../controllers/ModalController.js'
import Modal from './Modal'
import './AdminOfferCard.css'

function AdminOfferCard({ offer, setOnDelete, isExpanded, onToggleExpand }) {

    const { modalState, showConfirm } = useModal()

    const {
        // State
        loading,
        expanded,
        localOffer,
        availableTags,
        isEditingImage,
        imageUrl,
        setImageUrl,
        highlightTags,
        whyVisitTags,
        considerTags,
        priceRange,

        // Handlers
        handleUpdateField,
        handleSaveImageUrl,
        handleCancelImageEdit,
        toggleImageEdit,
        handleAddTag,
        handleRemoveTag,
        handleDelete,
        toggleExpanded

    } = useAdminOfferCard(offer, setOnDelete, isExpanded, onToggleExpand, showConfirm)


    return (
        <div>
            <div className="admin-offer-card">
                <div className="card-content">
                    {/*Image*/}
                    <div className="card-image-container">
                        <div className="card-image">
                            {localOffer.image_url ? (
                                <img src={localOffer.image_url} alt={localOffer.destination_name} />
                            ) : (
                                <div className="image-placeholder">No Image</div>
                            )}
                            <button
                                className="edit-image-btn"
                                onClick={toggleImageEdit}
                                title="Edit image URL"
                            >
                                ✏️
                            </button>
                        </div>
                    </div>

                    {/*Info*/}
                    <div className="card-info">
                        {/*Upper panel - so delete button shows in correct way*/}
                        <div className="upper-panel">
                            <div className="places-list">
                                <div className="edit-section">
                                    <h2>Where:</h2>
                                    <h2 className="destination-name">
                                        <EditableField
                                            value={localOffer.destination_name}
                                            onSave={(val) => handleUpdateField('destination_name', val)}
                                            className="dest-edit-field"
                                        />
                                    </h2>
                                </div>
                                <div className="edit-section">
                                    <h2>From:</h2>
                                    <h2 className="from-name">
                                        <EditableField
                                            value={localOffer.origin}
                                            onSave={(val) => handleUpdateField('origin', val)}
                                            className="dest-edit-field"
                                        />
                                    </h2>
                                </div>
                            </div>
                            <div className="delete-button-admin">
                                <button onClick={handleDelete}>
                                    ✗
                                </button>
                            </div>
                        </div>
                        {/*Section with all the prices*/}
                        <div className="price-section">
                            <div className="price-component">
                                Price: ${priceRange.min} - ${priceRange.max}
                            </div>
                            {/*Section with all the editable prices*/}
                            <div className="additional-prices">
                                <div className="price-component">
                                    <p>🏠</p>
                                    <EditableField
                                        value={localOffer.price_housing || 0}
                                        onSave={(val) => handleUpdateField('price_housing', Number(val))}
                                        type="number"
                                        prefix="$"
                                        className="price-edit-field"
                                    />
                                </div>
                                <div className="price-component">
                                    <p>🍴</p>
                                    <EditableField
                                        value={localOffer.price_food || 0}
                                        onSave={(val) => handleUpdateField('price_food', Number(val))}
                                        type="number"
                                        prefix="$"
                                        className="price-edit-field"
                                    />
                                </div>
                                <div className="price-component">
                                    <p>✈️</p>
                                    <EditableField
                                        value={localOffer.price_transport_amount || 0}
                                        onSave={(val) => handleUpdateField('price_transport_amount', Number(val))}
                                        type="number"
                                        prefix="$"
                                        className="price-edit-field"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/*Image URL Editor. Shows only when property is active*/}
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

                {/*Expand/Collapse - offer expander*/}
                <div className="expand-container">
                    <div className="expand-row" onClick={toggleExpanded}>
                        {loading ? "…" : expanded ? "▲" : "▼"}
                    </div>
                </div>

                {/*Expanded Content*/}
                {expanded && (
                    <div className="card-expandable">
                        <div className="expanded-content">
                            <div className="description">
                                <h3>Description:</h3>
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
                    </div>
                )}
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

export default AdminOfferCard