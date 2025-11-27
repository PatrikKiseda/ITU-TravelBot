import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { cancelOrder, getOrder, listOrders } from '../services/api'
import './Orders.css'

function OrdersPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [orders, setOrders] = useState([])
  const [orderDetails, setOrderDetails] = useState({})
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelSliderValue, setCancelSliderValue] = useState({})
  const [highlightId, setHighlightId] = useState(location.state?.highlightOrderId || null)

  useEffect(() => {
    if (location.state?.highlightOrderId) {
      setHighlightId(location.state.highlightOrderId)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    if (highlightId) {
      setExpandedOrderId(highlightId)
      const timeout = setTimeout(() => setHighlightId(null), 4000)
      return () => clearTimeout(timeout)
    }
  }, [highlightId])

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await listOrders()
      const activeOrders = (data || []).filter(
        (order) => order.order_status !== 'CANCELLED'
      )
      setOrders(activeOrders)
      setError(null)

      if (!activeOrders.length) {
        setOrderDetails({})
        return
      }

      const detailEntries = await Promise.all(
        activeOrders.map(async (order) => {
          try {
            const detail = await getOrder(order.id)
            return [order.id, detail]
          } catch (err) {
            console.error(`[Orders] Failed to load detail for ${order.id}:`, err)
            return null
          }
        })
      )

      const detailsObject = {}
      detailEntries.forEach((entry) => {
        if (entry) {
          const [id, detail] = entry
          detailsObject[id] = detail
        }
      })
      setOrderDetails(detailsObject)
    } catch (err) {
      console.error('[Orders] Error loading orders:', err)
      setError('Failed to load your upcoming travels: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (value) => {
    if (!value) {
      return '—'
    }
    try {
      return new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      })
    } catch {
      return value
    }
  }

  const handleExpand = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId))
    setCancelTarget(null)
  }

  const openCancelPanel = (orderId) => {
    setCancelTarget(orderId)
    setCancelSliderValue((prev) => ({ ...prev, [orderId]: 0 }))
  }

  const handleCancelPanelClose = (orderId) => {
    setCancelTarget(null)
    setCancelSliderValue((prev) => ({ ...prev, [orderId]: 0 }))
  }

  const handleCancelSliderChange = (orderId, value) => {
    const numericValue = Number(value)
    setCancelSliderValue((prev) => ({ ...prev, [orderId]: numericValue }))
    if (numericValue >= 95) {
      performCancelOrder(orderId)
    }
  }

  const performCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId)
      await loadOrders()
    } catch (err) {
      console.error('[Orders] Error cancelling order:', err)
      alert('Failed to cancel order: ' + (err.message || 'Unknown error'))
    } finally {
      setCancelTarget(null)
      setCancelSliderValue((prev) => ({ ...prev, [orderId]: 0 }))
    }
  }

  const renderOrderCard = (order) => {
    const detail = orderDetails[order.id]
    const offer = detail?.offer
    const dateRange = offer ? `${formatDate(offer.date_from)} - ${formatDate(offer.date_to)}` : 'Loading dates...'
    const destinationName = offer?.destination_name || 'Loading destination...'
    const pricePerPerson = detail?.total_price || 0
    const totalPrice = pricePerPerson * order.number_of_people
    const expanded = expandedOrderId === order.id
    const sliderValue = cancelSliderValue[order.id] || 0

    return (
      <div
        key={order.id}
        className={`order-card ${expanded ? 'expanded' : ''} ${highlightId === order.id ? 'highlight' : ''}`}
      >
        <div className="order-card-main" onClick={() => handleExpand(order.id)} role="button">
          <div className="order-card-info">
            <span className="order-destination">{destinationName}</span>
            <span className="order-dates">{dateRange}</span>
          </div>
          <button
            className="order-toggle-button"
            aria-label={expanded ? 'Collapse order' : 'Expand order'}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>

        {expanded && (
          <div className="order-card-details">
            <div className="order-detail-row">
              <div className="order-people">
                <div className="people-icons">
                  {Array.from({ length: Math.max(order.number_of_people, 1) }, (_, index) => (
                    <span key={index} className="person-icon">👤</span>
                  ))}
                </div>
                <div className="people-meta">
                  <span className="people-count">
                    {order.number_of_people} traveller{order.number_of_people > 1 ? 's' : ''}
                  </span>
                  <span className="price-per-person">
                    {pricePerPerson ? `${order.number_of_people} × $${pricePerPerson.toLocaleString()}` : 'Pricing information loading...'}
                  </span>
                </div>
              </div>
              <div className="order-total">
                <span className="total-label">Total</span>
                <span className="total-value">
                  {pricePerPerson ? `$${totalPrice.toLocaleString()}` : '—'}
                </span>
              </div>
            </div>

            <div className="order-description">
              <h4>Destination insight</h4>
              <p>{offer?.extended_description || offer?.short_description || 'No description provided yet.'}</p>
              <div className="order-meta">
                <span className="order-meta-chip">
                  Mode: {order.selected_transport_mode?.replace('_', ' ') || 'not selected'}
                </span>
                {offer?.origin && offer?.destination_where_to && (
                  <span className="order-meta-chip">
                    {offer.origin} → {offer.destination_where_to}
                  </span>
                )}
              </div>
            </div>

            <div className="orders-actions-footer">
              <button
                className="orders-detail-button"
                onClick={(event) => {
                  event.stopPropagation()
                  navigate(`/orders/${order.id}`)
                }}
              >
                View & edit order
              </button>
            </div>

            <div className="order-actions" onClick={(event) => event.stopPropagation()}>
              {cancelTarget === order.id ? (
                <div className="order-cancel-panel">
                  <button className="cancel-back-button" onClick={() => handleCancelPanelClose(order.id)}>
                    Go back
                  </button>
                  <div className="cancel-slider">
                    <label htmlFor={`cancel-slider-${order.id}`}>slide to cancel</label>
                    <input
                      id={`cancel-slider-${order.id}`}
                      type="range"
                      min="0"
                      max="100"
                      value={sliderValue}
                      onChange={(event) => handleCancelSliderChange(order.id, event.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <button className="order-delete-button" onClick={() => openCancelPanel(order.id)}>
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Header 
        filters={null}
        onFiltersChange={null}
        minPrice={0}
        maxPrice={10000}
        comparingOffers={null}
        onEnterComparison={null}
        sortBy={null}
        sortOrder={null}
        onSortChange={null}
      />
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <div className="orders-title">your upcoming travels</div>
            <button className="orders-back-button" onClick={() => navigate('/explore')}>
              Go back
            </button>
          </div>

        {loading ? (
          <div className="orders-state">Loading upcoming travels...</div>
        ) : error ? (
          <div className="orders-state error">{error}</div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            You have no upcoming travels yet. Accept a destination and confirm it to see it here.
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(renderOrderCard)}
          </div>
        )}
        </div>
      </div>
    </>
  )
}

export default OrdersPage

