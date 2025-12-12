import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrder, updateOrder, confirmOrder } from '../services/api'
import GiftEmail from '../components/GiftEmail'
import Notify from '../components/Notify';
import './Order.css'

function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [numberOfPeople, setNumberOfPeople] = useState(1)
  const [transportMode, setTransportMode] = useState('plane')
  const [specialRequirements, setSpecialRequirements] = useState([])
  const [isGift, setIsGift] = useState(false)
  const [giftData, setGiftData] = useState({
    recipientEmail: '',
    recipientName: '',
    senderName: '',
    note: '',
    subject: "You've been gifted a trip!"
  })
  const [updating, setUpdating] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [notify, setNotify] = useState({ message: '', type: '' })

  const showNotification = (message, type = 'info') => {
    setNotify({ message, type })
    setTimeout(() => setNotify({ message: '', type: '' }), 3000)
  }

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
      setSpecialRequirements(data.order.special_requirements || [])
      setIsGift(data.order.is_gift || false)
      setGiftData({
        recipientEmail: data.order.gift_recipient_email || '',
        recipientName: data.order.gift_recipient_name || '',
        senderName: data.order.gift_sender_name || '',
        note: data.order.gift_note || '',
        subject: data.order.gift_subject || "You've been gifted a trip!"
      })
      setError(null)
    } catch (err) {
      console.error('[OrderDetail] Error loading order:', err)
      setError('Failed to load order: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handlePeopleChange = (delta) => {
    if (!orderData) return
    const { order, remaining_capacity } = orderData

    // Remaining capacity excludes the current pending order,
    // so allow increasing up to current people + remaining when pending.
    const availableSlots =
      order.order_status === 'PENDING'
        ? remaining_capacity + order.number_of_people
        : remaining_capacity

    const maxPeople = Math.max(1, availableSlots || order.number_of_people)
    const newValue = Math.max(1, Math.min(numberOfPeople + delta, maxPeople))
    setNumberOfPeople(newValue)
  }

  const handleUpdateOrder = async () => {
    try {
      setUpdating(true)
      const giftDataToSend = isGift ? {
        isGift: true,
        ...giftData
      } : {
        isGift: false
      }
      await updateOrder(orderId, numberOfPeople, transportMode, specialRequirements, giftDataToSend)
      await loadOrder()
      showNotification('Order updated successfully!', 'success')
    } catch (err) {
      console.error('[OrderDetail] Error updating order:', err)
      showNotification('Failed to update order', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const toggleRequirement = (requirement) => {
    setSpecialRequirements(prev => {
      if (prev.includes(requirement)) {
        return prev.filter(r => r !== requirement)
      } else {
        return [...prev, requirement]
      }
    })
  }

  const handleConfirmOrder = async () => {
    try {
      setConfirming(true)
      await confirmOrder(orderId)
      showNotification('Order confirmed successfully!', 'success')
      navigate('/orders', { state: { highlightOrderId: orderId } })
    } catch (err) {
      console.error('[OrderDetail] Error confirming order:', err)
      showNotification('Failed to confirm order', 'error')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return <div className="order-page"><div className="loading">Loading order...</div></div>
  }

  if (error || !orderData) {
    return <div className="order-page"><div className="error">{error || 'Order not found'}</div></div>
  }

  const { order, offer, remaining_capacity, total_price } = orderData
/*   const availableSlots =
    order.order_status === 'PENDING'
      ? remaining_capacity + order.number_of_people
      : remaining_capacity
      // recompute dynamically based on selected number of people */
  const computedRemaining =
    order.order_status === 'PENDING'
      ? remaining_capacity + (order.number_of_people - numberOfPeople)
      : remaining_capacity - (numberOfPeople - order.number_of_people)

  const transportPrice =
    transportMode === "car_own" ? 0 : (offer.price_transport_amount || 0)

  const computedTotalPrice =
    offer.price_housing +
    offer.price_food +
    transportPrice

  const isConfirmed = order.order_status === 'CONFIRMED'


  return (
    <div className="order-page">
      <Notify message={notify.message} type={notify.type} />
      <div className="order-content">
        <button className="orders-back-button" onClick={() => navigate('/orders')}>
          ← Back to upcoming travels
        </button>

        <div className="order-destination-card">
          <div className="destination-header">
            <h1 className="destination-title">{offer.destination_name}</h1>
            <div className="destination-header-divider"></div>
            <div className="gift-toggle-header">
              <label className="gift-toggle-header-label">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="gift-toggle-header-checkbox"
                />
                <span className="gift-toggle-header-text">🎁 Give this trip 🎁</span>
              </label>
            </div>
          </div>

          <div className="destination-details">
            <div className="destination-image-section">
              {offer.image_url && (
                <img src={offer.image_url} alt={offer.destination_name} className="main-image" />
              )}
            </div>

            <div className="destination-info">
              <div className="price-info">
              <div className="price-range">
                Price per traveller: ${computedTotalPrice}
              </div>
                <div className="price-breakdown">
                <div className="price-item">
                  <span className="price-icon">
                    {transportMode === "car_own" ? "🚗" : transportMode === "train_bus" ? "🚌" : "✈️"}
                  </span>
                  <span>Transport: ${transportPrice}</span>
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
            <div className="form-group people-section">
              <div className="people-group-left">
                <label className="form-label">how many of us?</label>
                <div className="people-picker">
                  <button
                    className="picker-button"
                    onClick={() => handlePeopleChange(-1)}
                    disabled={numberOfPeople <= 1 || isConfirmed}
                  >
                    −
                  </button>
                  <div className="people-count">
                    {Array.from({ length: numberOfPeople }, (_, i) => (
                      <span key={i} className="person-icon">👤</span>
                    ))}
                  </div>
                  <button
                    className="picker-button"
                    onClick={() => handlePeopleChange(1)}
                    disabled={computedRemaining <= 0 || isConfirmed}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="special-requirements-group">
                <label className="form-label">Special requirements</label>
                <div className="requirement-buttons">
                  <button
                    className={`requirement-button ${specialRequirements.includes('allergies') ? 'active' : ''}`}
                    onClick={() => toggleRequirement('allergies')}
                  >
                    <span className="requirement-icon">⚠️</span>
                    <span>Allergies</span>
                  </button>
                  <button
                    className={`requirement-button ${specialRequirements.includes('disability') ? 'active' : ''}`}
                    onClick={() => toggleRequirement('disability')}
                  >
                    <span className="requirement-icon">♿</span>
                    <span>Disability</span>
                  </button>
                  <button
                    className={`requirement-button ${specialRequirements.includes('elderly') ? 'active' : ''}`}
                    onClick={() => toggleRequirement('elderly')}
                  >
                    <span className="requirement-icon">👴</span>
                    <span>Elderly</span>
                  </button>
                  <button
                    className={`requirement-button ${specialRequirements.includes('wheelchair_access') ? 'active' : ''}`}
                    onClick={() => toggleRequirement('wheelchair_access')}
                  >
                    <span className="requirement-icon">♿</span>
                    <span>Wheelchair</span>
                  </button>
                  <button
                    className={`requirement-button ${specialRequirements.includes('dietary_restrictions') ? 'active' : ''}`}
                    onClick={() => toggleRequirement('dietary_restrictions')}
                  >
                    <span className="requirement-icon">🥗</span>
                    <span>Dietary</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Capacity remaining</label>
              <div className="capacity-display">
                <span className="capacity-value">{Math.max(0, computedRemaining)}</span>
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
                  onClick={() => !isConfirmed && setTransportMode('car_own')}
                >
                  <span className="transport-icon">🚗</span>
                  <span>own mode of transportation</span>
                </button>
                <button
                  className={`transport-option ${transportMode === 'train_bus' ? 'active' : ''}`}
                  onClick={() => !isConfirmed && setTransportMode('train_bus')}
                >
                  <span className="transport-icon">🚌</span>
                  <span>train or bus</span>
                </button>
                <button
                  className={`transport-option ${transportMode === 'plane' ? 'active' : ''}`}
                  onClick={() => !isConfirmed && setTransportMode('plane')}
                >
                  <span className="transport-icon">✈️</span>
                  <span>plane</span>
                </button>
              </div>
            </div>
          </div>

          {isGift && (
            <div className="form-section">
              <GiftEmail
                offer={offer}
                giftData={giftData}
                onChange={isConfirmed ? null : setGiftData}
              />
            </div>
          )}

          <div className="form-actions">
            <button
              className="update-button"
              onClick={handleUpdateOrder}
              disabled={
                updating ||
                (numberOfPeople === order.number_of_people && 
                 transportMode === order.selected_transport_mode &&
                 JSON.stringify(specialRequirements.sort()) === JSON.stringify((order.special_requirements || []).sort()) &&
                 isGift === (order.is_gift || false) &&
                 (!isGift || (
                   giftData.recipientEmail === (order.gift_recipient_email || '') &&
                   giftData.recipientName === (order.gift_recipient_name || '') &&
                   giftData.senderName === (order.gift_sender_name || '') &&
                   giftData.note === (order.gift_note || '')
                 )))
              }
            >
              {updating ? 'Updating...' : 'Update Order'}
            </button>
            <button
              className="confirm-order-button"
              onClick={handleConfirmOrder}
              disabled={confirming || order.order_status === 'CONFIRMED'}
            >
              {confirming
                ? 'Confirming...'
                : order.order_status === 'CONFIRMED'
                  ? 'Already Confirmed'
                  : 'Confirm and order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage