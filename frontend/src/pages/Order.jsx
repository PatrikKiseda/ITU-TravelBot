import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrder, updateOrder, confirmOrder, updateOrderNote } from '../services/api'
import GiftEmail from '../components/GiftEmail'
import Notify from '../components/Notify';
import './Order.css'

// manages the detailed view and editing of a single travel order
function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [numberOfPeople, setNumberOfPeople] = useState(1)
  const [transportMode, setTransportMode] = useState('plane')
  const [specialRequirements, setSpecialRequirements] = useState([])
  const [selectedAllergies, setSelectedAllergies] = useState([])
  // tracks specific dietary restriction selections
  const [selectedDietary, setSelectedDietary] = useState([])
  // toggles the gift section visibility and data
  const [isGift, setIsGift] = useState(false)
  const [note, setNote] = useState('')

  // state for the gift email form
  const [giftData, setGiftData] = useState({
    recipientEmail: '',
    recipientName: '',
    senderName: '',
    note: '',
    subject: "You've been gifted a trip!"
  })
  const [updating, setUpdating] = useState(false)
  // loading state for the confirm button
  const [confirming, setConfirming] = useState(false)
  const [notify, setNotify] = useState({ message: '', type: '' })

  // displays a notification message
  const showNotification = (message, type = 'info') => {
    setNotify({ message, type })
    setTimeout(() => setNotify({ message: '', type: '' }), 3000)
  }

  // fetches order data when the component mounts or orderId changes
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
      const requirements = data.order.special_requirements || []
      setSpecialRequirements(requirements)
      const nonFoodAllergies = ['pollen', 'dust_mites', 'pet_dander', 'mold', 'latex', 'insect_stings', 'medications', 'sunlight']
      setSelectedAllergies(requirements.filter(r => nonFoodAllergies.includes(r)))
      const dietaryItems = ['peanuts', 'tree_nuts', 'shellfish', 'fish', 'eggs', 'milk', 'soy', 'wheat', 'sesame', 'mustard', 'celery', 'lupin', 'lactose_intolerance', 'gluten', 'vegetarianism']
      

      setSelectedDietary(requirements.filter(r => dietaryItems.includes(r)))
      setIsGift(data.order.is_gift || false)
      setNote(data.note || '')
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

  // handles incrementing or decrementing the number of travellers
  const handlePeopleChange = (delta) => {
    if (!orderData) return
    const { order, remaining_capacity } = orderData

    // remaining capacity excludes the current pending order,
    // calculate the true max capacity based on order status
    const availableSlots =
      order.order_status === 'PENDING'
        ? remaining_capacity + order.number_of_people
        : remaining_capacity

    const maxPeople = Math.max(1, availableSlots || order.number_of_people)
    const newValue = Math.max(1, Math.min(numberOfPeople + delta, maxPeople))
    setNumberOfPeople(newValue)
  }

  // saves the current state of the order to backend
  const handleUpdateOrder = async () => {
    try {
      setUpdating(true)

      const giftDataToSend = isGift
        ? { isGift: true, ...giftData }
        : { isGift: false }

        // asynchronous wait for updating order
      await updateOrder(
        orderId,
        numberOfPeople,
        transportMode,
        specialRequirements,
        giftDataToSend
      )

      // asynchr. wait of saving note
      await updateOrderNote(orderId, note)

      await loadOrder()
      showNotification('Order updated successfully!', 'success')
    } catch (err) {
      console.error('[OrderDetail] Error updating order:', err)
      showNotification('Failed to update order', 'error')
    } finally {
      setUpdating(false)
    }
  }


  // toggles main requirement categories
  const toggleRequirement = (requirement) => {
    setSpecialRequirements(prev => {
      const nonFoodAllergies = ['pollen', 'dust_mites', 'pet_dander', 'mold', 'latex', 'insect_stings', 'medications', 'sunlight']
      const allDietaryItems = ['peanuts', 'tree_nuts', 'shellfish', 'fish', 'eggs', 'milk', 'soy', 'wheat', 'sesame', 'mustard', 'celery', 'lupin', 'lactose_intolerance', 'gluten', 'vegetarianism']
      
      if (prev.includes(requirement)) {
        const newRequirements = prev.filter(r => r !== requirement)
        if (requirement === 'allergies') {
          // remove all non-food allergy items
          const cleaned = newRequirements.filter(r => !nonFoodAllergies.includes(r))
          setSelectedAllergies([])
          return cleaned
        } else if (requirement === 'dietary_restrictions') {
          // remove all dietary items from main list
          const cleaned = newRequirements.filter(r => !allDietaryItems.includes(r))
          setSelectedDietary([])
          return cleaned
        }
        return newRequirements
      } else {
        return [...prev, requirement]
      }
    })
  }

  // toggles a specific non-food allergy
  const toggleAllergy = (allergy) => {
    setSelectedAllergies(prev => {
      const newAllergies = prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
      
      // update special requirements
      const nonFoodAllergies = ['pollen', 'dust_mites', 'pet_dander', 'mold', 'latex', 'insect_stings', 'medications', 'sunlight']
      const allDietaryItems = ['peanuts', 'tree_nuts', 'shellfish', 'fish', 'eggs', 'milk', 'soy', 'wheat', 'sesame', 'mustard', 'celery', 'lupin', 'lactose_intolerance', 'gluten', 'vegetarianism']
      const baseRequirements = specialRequirements.filter(r => 
        !nonFoodAllergies.includes(r) && 
        !allDietaryItems.includes(r) && 
        r !== 'allergies' && 
        r !== 'dietary_restrictions'
      )
      
      const newRequirements = [
        ...baseRequirements,
        ...(newAllergies.length > 0 ? ['allergies'] : []),
        ...(selectedDietary.length > 0 ? ['dietary_restrictions'] : []),
        ...newAllergies,
        ...selectedDietary
      ]
      
      setSpecialRequirements(newRequirements)
      return newAllergies
    })
  }

  // toggles a specific dietary restriction
  const toggleDietary = (dietary) => {
    setSelectedDietary(prev => {
      const newDietary = prev.includes(dietary)
        ? prev.filter(d => d !== dietary)
        : [...prev, dietary]
      
      const nonFoodAllergies = ['pollen', 'dust_mites', 'pet_dander', 'mold', 'latex', 'insect_stings', 'medications', 'sunlight']

      const allDietaryItems = ['peanuts', 'tree_nuts', 'shellfish', 'fish', 'eggs', 'milk', 'soy', 'wheat', 'sesame', 'mustard', 'celery', 'lupin', 'lactose_intolerance', 'gluten', 'vegetarianism']
      const baseRequirements = specialRequirements.filter(r => 
        !nonFoodAllergies.includes(r) && 
        !allDietaryItems.includes(r) && 
        r !== 'allergies' && 
        r !== 'dietary_restrictions'
      )
      
      const newRequirements = [
        ...baseRequirements,
        ...(selectedAllergies.length > 0 ? ['allergies'] : []),
        ...(newDietary.length > 0 ? ['dietary_restrictions'] : []),
        ...selectedAllergies,
        ...newDietary
      ]
      
      setSpecialRequirements(newRequirements)
      return newDietary
    })
  }

  // finalizes the order by updating and then confirming it
  const handleConfirmOrder = async () => {
    try {
      setConfirming(true)

      const giftDataToSend = isGift
        ? { isGift: true, ...giftData }
        : { isGift: false }

      await updateOrder(
        orderId,
        numberOfPeople,
        transportMode,
        specialRequirements,
        giftDataToSend
      )

      await confirmOrder(orderId)

      // navigate to the orders list
      showNotification('Order updated and confirmed successfully!', 'success')
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

  const { order, offer, remaining_capacity} = orderData

  // calculates the remaining capacity
  const computedRemaining =
    order.order_status === 'PENDING'
      ? remaining_capacity + (order.number_of_people - numberOfPeople)
      : remaining_capacity - (numberOfPeople - order.number_of_people)

  // sets transport price to 0 if user chooses their own car
  const transportPrice =
    transportMode === "car_own" ? 0 : (offer.price_transport_amount || 0)

  // calculates the total price per person based on selections
  const computedTotalPrice =
    offer.price_housing +
    offer.price_food +
    transportPrice

  const isConfirmed = order.order_status === 'CONFIRMED'

  // format date strings for display
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const travelDates = offer.date_from && offer.date_to
    ? `${formatDate(offer.date_from)} - ${formatDate(offer.date_to)}`
    : ''

  const isCancelled = order.order_status === 'CANCELLED';


  return (
    <div className="order-page">
      <Notify message={notify.message} type={notify.type} />
      <div className="order-content">
        <button className="orders-back-button" onClick={() => navigate('/orders')}>
          ← Back to upcoming travels
        </button>

        <div className="order-destination-card">
          <div className="destination-header">
            <div className="destination-title-group">
              <h1 className="destination-title">{offer.destination_name}</h1>

              {travelDates && (
                <span className="destination-dates">
                  📅 {travelDates}
                </span>
              )}
            </div>

            <div className="destination-header-divider"></div>

            <div className="gift-toggle-header">
              <button
                className={`requirement-button ${isGift ? 'active' : ''}`}
                onClick={() => setIsGift(prev => !prev)}
                disabled={isConfirmed || isCancelled}
              >
                <span className="requirement-icon">🎁</span>
                <span>Give this trip</span>
              </button>
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
                  <div className="price-row">
                    <span className="price-icon">
                      {transportMode === "car_own" ? "🚗" : transportMode === "train_bus" ? "🚌" : "✈️"}
                    </span>
                    <span className="price-label">Transport: </span>
                    <span className="price-value">${transportPrice}</span>
                  </div>

                  <div className="price-row">
                    <span className="price-icon">🏠</span>
                    <span className="price-label">Housing: </span>
                    <span className="price-value">${offer.price_housing || 0}</span>
                  </div>

                  <div className="price-row">
                    <span className="price-icon">🍴</span>
                    <span className="price-label">Food: </span>
                    <span className="price-value">${offer.price_food || 0}</span>
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
                    disabled={numberOfPeople <= 1 || isConfirmed || isCancelled}
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
                    disabled={computedRemaining <= 0 || isConfirmed || isCancelled}
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
                    disabled={isConfirmed || isCancelled}
                  >
                    <span className="requirement-icon">⚠️</span>
                    <span>Allergies</span>
                  </button>
                  <button
                    className={`requirement-button ${specialRequirements.includes('disability') ? 'active' : ''}`}
                    onClick={() => toggleRequirement('disability')}
                    disabled={isConfirmed || isCancelled}
                  >
                    <span className="requirement-icon">♿</span>
                    <span>Disability</span>
                  </button>
                  <button
                    className={`requirement-button ${specialRequirements.includes('elderly') ? 'active' : ''}`}
                    onClick={() => toggleRequirement('elderly')}
                    disabled={isConfirmed || isCancelled}
                  >
                    <span className="requirement-icon">👴</span>
                    <span>Elderly</span>
                  </button>
                  <button
                    className={`requirement-button ${specialRequirements.includes('dietary_restrictions') ? 'active' : ''}`}
                    onClick={() => toggleRequirement('dietary_restrictions')}
                    disabled={isConfirmed || isCancelled}
                  >
                    <span className="requirement-icon">🥗</span>
                    <span>Dietary</span>
                  </button>
                </div>
                
                {specialRequirements.includes('allergies') && (
                  <div className="allergy-list">
                    <label className="allergy-list-label">Select allergies:</label>
                    <div className="allergy-items">
                      {['pollen', 'dust_mites', 'pet_dander', 'mold', 'latex', 'insect_stings', 'medications', 'sunlight'].map(allergy => (
                        <button
                          key={allergy}
                          className={`allergy-item ${selectedAllergies.includes(allergy) ? 'active' : ''}`}
                          onClick={() => toggleAllergy(allergy)}
                          disabled={isConfirmed || isCancelled}
                        >
                          {allergy.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {specialRequirements.includes('dietary_restrictions') && (
                  <div className="dietary-list">
                    <label className="dietary-list-label">Select dietary restrictions:</label>
                    <div className="dietary-items">
                      {['peanuts', 'tree_nuts', 'shellfish', 'fish', 'eggs', 'milk', 'soy', 'wheat', 'sesame', 'mustard', 'celery', 'lupin', 'lactose_intolerance', 'gluten', 'vegetarianism'].map(dietary => (
                        <button
                          key={dietary}
                          className={`dietary-item ${selectedDietary.includes(dietary) ? 'active' : ''}`}
                          onClick={() => toggleDietary(dietary)}
                          disabled={isConfirmed || isCancelled}
                        >
                          {dietary.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                  onClick={() => !isConfirmed && !isCancelled && setTransportMode('car_own')}
                >
                  <span className="transport-icon">🚗</span>
                  <span>own mode of transportation</span>
                </button>
                <button
                  className={`transport-option ${transportMode === 'train_bus' ? 'active' : ''}`}
                  onClick={() => !isConfirmed && !isCancelled && setTransportMode('train_bus')}
                >
                  <span className="transport-icon">🚌</span>
                  <span>train or bus</span>
                </button>
                <button
                  className={`transport-option ${transportMode === 'plane' ? 'active' : ''}`}
                  onClick={() => !isConfirmed && !isCancelled && setTransportMode('plane')}
                >
                  <span className="transport-icon">✈️</span>
                  <span>plane</span>
                </button>
              </div>
            </div>
          </div>
          <div className="form-group">
              <label className="form-label">Travel note</label>
              <textarea
                className="note-textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Your personal note about this trip…"
                disabled={isConfirmed || isCancelled}
              />
            </div>


          {isGift && (
            <div className="form-section">
              <GiftEmail
                offer={offer}
                giftData={giftData}
                onChange={(isConfirmed || isCancelled) ? null : setGiftData}
              />
            </div>
          )}

          <div className="form-actions">
            <button
              className="update-button"
              onClick={handleUpdateOrder}
              disabled={
                isConfirmed || isCancelled ||
                (updating &&
                  numberOfPeople === order.number_of_people &&
                  note === (orderData.note || '') &&
                  transportMode === order.selected_transport_mode &&
                  JSON.stringify(specialRequirements.sort()) ===
                    JSON.stringify((order.special_requirements || []).sort()) &&
                  isGift === (order.is_gift || false) &&
                  (!isGift || (
                    giftData.recipientEmail === (order.gift_recipient_email || '') &&
                    giftData.recipientName === (order.gift_recipient_name || '') &&
                    giftData.senderName === (order.gift_sender_name || '') &&
                    giftData.note === (order.gift_note || '')
                  ))
                )
              }

            >
              {updating ? 'Updating...' : 'Save Order'}
            </button>
            <button
              className="confirm-order-button"
              onClick={handleConfirmOrder}
              disabled={confirming || isCancelled || order.order_status === 'CONFIRMED'}
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