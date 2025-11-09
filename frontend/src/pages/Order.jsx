import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrder, updateOrder, confirmOrder } from '../services/api'
import './Order.css'

function Order() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [numberOfPeople, setNumberOfPeople] = useState(1)
  const [transportMode, setTransportMode] = useState('plane')
  const [updating, setUpdating] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const data = await getOrder(orderId)
      setOrderData(data)
      setNumberOfPeople(data.order.number_of_people)
      setTransportMode(data.order.selected_transport_mode)
      setError(null)
    } catch (err) {
      console.error('[Order] Error loading order:', err)
      setError('Failed to load order: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrder = async () => {
    try {
      setUpdating(true)
      await updateOrder(orderId, numberOfPeople, transportMode)
      // Reload order to get updated data
      await loadOrder()
      alert('Order updated successfully!')
    } catch (err) {
      console.error('[Order] Error updating order:', err)
      alert('Failed to update order: ' + (err.message || 'Unknown error'))
    } finally {
      setUpdating(false)
    }
  }

  const handleConfirmOrder = async () => {
    try {
      setConfirming(true)
      await confirmOrder(orderId)
      alert('Order confirmed successfully!')
      // Navigate back to plan page
      navigate('/plan')
    } catch (err) {
      console.error('[Order] Error confirming order:', err)
      alert('Failed to confirm order: ' + (err.message || 'Unknown error'))
    } finally {
      setConfirming(false)
    }
  }

  const handlePeopleChange = (delta) => {
    const newValue = Math.max(1, Math.min(numberOfPeople + delta, orderData?.remaining_capacity || 1))
    setNumberOfPeople(newValue)
  }

  if (loading) {
    return <div className="order-page"><div className="loading">Loading order...</div></div>
  }

  if (error || !orderData) {
    return <div className="order-page"><div className="error">{error || 'Order not found'}</div></div>
  }

  const { order, offer, remaining_capacity, total_price } = orderData

  return (
    <div className="order-page">
      <div className="order-content">
        <div className="order-destination-card">
          <h1 className="destination-title">{offer.destination_name}</h1>
          
          <div className="destination-details">
            <div className="destination-image-section">
              {offer.image_url && (
                <img src={offer.image_url} alt={offer.destination_name} className="main-image" />
              )}
            </div>

            <div className="destination-info">
              <div className="price-info">
                <div className="price-range">Price: ${total_price || 'N/A'}</div>
                <div className="price-breakdown">
                  <div className="price-item">
                    <span className="price-icon">✈️</span>
                    <span>Transport: ${offer.price_transport_amount || 0}</span>
                  </div>
                  <div className="price-item">
                    <span className="price-icon">🏠</span>
                    <span>Housing: ${offer.price_housing || 0}</span>
                  </div>
                  <div className="price-item">
                    <span className="price-icon">🍴</span>
                    <span>Food: ${offer.price_food || 0}</span>
                  </div>
                </div>
              </div>

              {offer.extended_description && (
                <div className="description">
                  <p>{offer.extended_description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="order-form">
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">how many of us?</label>
              <div className="people-picker">
                <button 
                  className="picker-button"
                  onClick={() => handlePeopleChange(-1)}
                  disabled={numberOfPeople <= 1}
                >
                  −
                </button>
                <div className="people-count">
                  {Array.from({ length: numberOfPeople }, (_, i) => (
                    <span key={i} className="person-icon">👤</span>
                  ))}
                  {numberOfPeople < (remaining_capacity || 1) && (
                    <span className="person-icon add-icon" onClick={() => handlePeopleChange(1)}>+</span>
                  )}
                </div>
                <button 
                  className="picker-button"
                  onClick={() => handlePeopleChange(1)}
                  disabled={numberOfPeople >= (remaining_capacity || 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Amount available</label>
              <div className="capacity-display">
                <span className="capacity-value">{remaining_capacity || 0}</span>
                <span className="capacity-icon">👤</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">how do we travel?</label>
              <div className="transport-options">
                <button
                  className={`transport-option ${transportMode === 'car_own' ? 'active' : ''}`}
                  onClick={() => setTransportMode('car_own')}
                >
                  <span className="transport-icon">🚗</span>
                  <span>own mode of transportation</span>
                </button>
                <button
                  className={`transport-option ${transportMode === 'train_bus' ? 'active' : ''}`}
                  onClick={() => setTransportMode('train_bus')}
                >
                  <span className="transport-icon">🚌</span>
                  <span>45€/person</span>
                </button>
                {offer.price_transport_mode === 'plane' && (
                  <button
                    className={`transport-option ${transportMode === 'plane' ? 'active' : ''}`}
                    onClick={() => setTransportMode('plane')}
                  >
                    <span className="transport-icon">✈️</span>
                    <span>Plane</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              className="update-button"
              onClick={handleUpdateOrder}
              disabled={updating || (numberOfPeople === order.number_of_people && transportMode === order.selected_transport_mode)}
            >
              {updating ? 'Updating...' : 'Update Order'}
            </button>
            <button
              className="confirm-order-button"
              onClick={handleConfirmOrder}
              disabled={confirming || order.order_status === 'CONFIRMED'}
            >
              {confirming ? 'Confirming...' : order.order_status === 'CONFIRMED' ? 'Already Confirmed' : 'Confirm and order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Order

