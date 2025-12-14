// Created by Shaposhnik Bogdan (xshapo04)
import React, {useEffect} from 'react'
import './Modal.css'

function Modal({
                   isOpen,
                   title,
                   message,
                   type = 'confirm', // 'confirm' или 'alert'
                   onConfirm,
                   onCancel,
                   confirmText = 'OK',
                   cancelText = 'Cancel',
                   confirmButtonStyle = 'primary' // 'primary', 'danger', 'success'
               }) {
    if (!isOpen) return null

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && type === 'alert') {
            onConfirm?.()
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            if (type === 'alert') {
                onConfirm?.()
            } else {
                onCancel?.()
            }
        }
        if (e.key === 'Enter') {
            onConfirm?.()
        }
    }

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            return () => document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen])

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                </div>

                <div className="modal-body">
                    <p>{message}</p>
                </div>

                <div className="modal-actions">
                    {type === 'confirm' && (
                        <button
                            className="modal-btn modal-cancel-btn"
                            onClick={onCancel}
                        >
                            {cancelText}
                        </button>
                    )}
                    {/*Autofocus causes internal React problem , which shows in the console as a warning*/}
                    <button
                        className={`modal-btn modal-confirm-btn ${confirmButtonStyle}`}
                        onClick={onConfirm}
                        autoFocus
                    >

                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Modal