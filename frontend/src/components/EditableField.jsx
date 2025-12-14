// Created by Shaposhnik Bogdan (xshapo04)
import React, { useState } from 'react'
import './EditableField.css'

function EditableField({ value, onSave, type = "text", prefix = "", className = "" }) {
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(value)
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        if (editValue === value) {
            setIsEditing(false)
            return
        }

        setIsSaving(true)
        try {
            await onSave(editValue)
            setIsEditing(false)
        } catch (err) {
            console.error('Failed to save:', err)
            setEditValue(value) // Откатываем при ошибке
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setEditValue(value)
        setIsEditing(false)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSave()
        }
        if (e.key === 'Escape') {
            handleCancel()
        }
    }


    // main window while editing
    if (isEditing) {
        return (
            <div className={`editable-field editing ${className}`}>
                {type === "textarea" ? (
                    <textarea
                        className={className}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSave}
                        autoFocus
                        disabled={isSaving}
                    />
                ) : (
                    <input
                        className={className}
                        type={type}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSave}
                        autoFocus
                        disabled={isSaving}
                    />
                )}
                {isSaving && <span className="saving-indicator">💾</span>}
            </div>
        )
    }

    //if nothing happens (idle mode)
    return (
        <div
            className={`editable-field ${className}`}
            onClick={() => setIsEditing(true)}
            title="Click to edit"
        >
            {prefix}{value}
            <span className="edit-icon">✏️</span>
        </div>
    )
}

export default EditableField