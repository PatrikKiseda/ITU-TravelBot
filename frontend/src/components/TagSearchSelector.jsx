
import React, { useState, useEffect, useRef } from 'react'
import './TagSearchSelector.css'
import {createTag} from "../services/api.js";

function TagSearchSelector({
                               availableTags,      // Все доступные теги из базы
                               selectedTags,       // Уже выбранные теги
                               onAddTag,          // Callback при добавлении тега
                               onRemoveTag,       // Callback при удалении тега
                               tagType,           // Тип тега (highlights, why_visit, things_to_consider)
                               offerId            // ID оффера
                           }) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredTags, setFilteredTags] = useState([])
    const [isCreating, setIsCreating] = useState(false)
    const dropdownRef = useRef(null)

// Фильтруем теги по типу и поисковому запросу
    useEffect(() => {
        const selectedTagIds = selectedTags.map(t => t.id)

        const filtered = availableTags
            .filter(tag => tag.type === tagType)
            .filter(tag => !selectedTagIds.includes(tag.id))
            .filter(tag =>
                tag.tag_name.toLowerCase().includes(searchQuery.toLowerCase())
            )

        setFilteredTags(filtered)
    }, [searchQuery, availableTags, selectedTags, tagType])

// Закрытие при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
                setSearchQuery('')
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleAddTag = async (tag) => {
        await onAddTag(tag)
        setSearchQuery('')
        setIsOpen(false)
    }

    const handleRemoveTag = async (tagId) => {
        await onRemoveTag(tagId)
    }

    const handleAddExistingTag = async (tag) => {
        await onAddTag(tag)
        setSearchQuery('')
        setIsOpen(false)
    }

    const handleCreateNewTag = async () => {
        const trimmedQuery = searchQuery.trim()

        // Проверяем есть ли уже такой тег (case-insensitive)
        const existingTag = availableTags.find(
            tag => tag.tag_name.toLowerCase() === trimmedQuery.toLowerCase() &&
                tag.type === tagType
        )

        if (existingTag) {
            // Если тег уже есть - просто добавляем его
            // await handleAddExistingTag(existingTag)
            alert("Tag already exists")
            return
        }

        // Иначе создаем новый
        setIsCreating(true)
        try {
            const newTag = await createTag({
                tag_name: trimmedQuery,
                type: tagType
            })
            await onAddTag(newTag)
            setSearchQuery('')
            setIsOpen(false)
        } catch (err) {
            console.error('Failed to create tag:', err)
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="tag-search-selector" ref={dropdownRef}>
            {/* Список выбранных тегов */}
            <div className="selected-tags-list">
                {selectedTags.map(tag => (
                    <div key={tag.id} className="selected-tag-item">
                        • {tag.tag_name}
                        <button
                            className="remove-tag-btn"
                            onClick={() => handleRemoveTag(tag.id)}
                            title="Remove tag"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {/* Кнопка добавления */}
            <button
                className="add-tag-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                + Add Tag
            </button>

            {/* Dropdown с поиском */}
            {isOpen && (
                <div className="tag-dropdown">
                    <input
                        type="text"
                        className="tag-search-input"
                        placeholder="Search tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />

                    <div className="tag-options-list">
                        {filteredTags.length > 0 ? (
                            filteredTags.map(tag => (
                                <div
                                    key={tag.id}
                                    className="tag-option"
                                    onClick={() => handleAddTag(tag)}
                                >
                                    {tag.tag_name}
                                </div>
                            ))
                        ) : (
                            <div className="no-tags-message">
                                {searchQuery ? 'No tags found' : 'No more tags available'}
                            </div>
                        )}
                    </div>
                    {/*checks if there is the exact expression(any-case) and if not, shows create button*/}
                    {searchQuery && (() => {
                        for (const tag of filteredTags) {
                            if (tag.tag_name.toLowerCase() === searchQuery.toLowerCase()) {
                                return false
                            }
                        }
                        return true
                    })() && (
                        <div className="create-new-tag">
                            <button onClick={handleCreateNewTag}>
                                + Create "{searchQuery}"
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default TagSearchSelector