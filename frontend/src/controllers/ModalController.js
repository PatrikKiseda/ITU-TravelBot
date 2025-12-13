import {useState} from 'react'

export function useModal() {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'confirm',
        confirmButtonStyle: 'primary',
        onConfirm: null,
        onCancel: null,
        confirmText: 'OK',
        cancelText: 'Cancel'
    })

    // Показать confirm диалог (с двумя кнопками)
    const showConfirm = ({ title, message, confirmButtonStyle = 'primary', confirmText = 'OK', cancelText = 'Cancel' }) => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                title,
                message,
                type: 'confirm',
                confirmButtonStyle,
                confirmText,
                cancelText,
                onConfirm: () => {
                    setModalState(prev => ({ ...prev, isOpen: false }))
                    resolve(true)
                },
                onCancel: () => {
                    setModalState(prev => ({ ...prev, isOpen: false }))
                    resolve(false)
                }
            })
        })
    }

    // Показать alert диалог (с одной кнопкой)
    const showAlert = ({ title, message, confirmButtonStyle = 'primary', confirmText = 'OK' }) => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                title,
                message,
                type: 'alert',
                confirmButtonStyle,
                confirmText,
                onConfirm: () => {
                    setModalState(prev => ({ ...prev, isOpen: false }))
                    resolve(true)
                },
                onCancel: null
            })
        })
    }

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }))
    }

    return {
        modalState,
        showConfirm,
        showAlert,
        closeModal
    }
}