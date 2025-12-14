import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { cancelOrder, getOrder, listOrders, emptyTrash } from '../services/api'
import './Orders.css'
import SwipeToCancel from "../components/SwipeToCancel";
import Notify from '../components/Notify';

// renders the  page
// orders are categorized by status (Confirmed, Unconfirmed, Cancelled)
function OrdersPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [orders, setOrders] = useState([])
  // stores detailed data for each order, keyed by order id
  const [orderDetails, setOrderDetails] = useState({})
  // tracks the currently expanded order card
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // id of the order targeted for cancellation
  const [cancelTarget, setCancelTarget] = useState(null)
  const [highlightId, setHighlightId] = useState(location.state?.highlightOrderId || null)
  // state for showing notifications to the user
  const [notify, setNotify] = useState({ message: '', type: '' });

  const cancelledOrders = orders.filter(o => o.order_status === 'CANCELLED')

  // clears history for cancelled orders.
  const emptyTrashHandler = async () => {
    try {
      setLoading(true);
      await emptyTrash();
      const updatedOrders = await listOrders();
      setOrders(updatedOrders || []);
      showNotification('List of cancelled emptied successfully', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Failed to empty cancelled orders list', 'error');
    } finally {
      setLoading(false);
    }
  };





  // displays a notification message
  const showNotification = (message, type = 'info') => {
    setNotify({ message, type });
    setTimeout(() => setNotify({ message: '', type: '' }), 3000);
  };


  //  handle one-time state passing from navigation
  useEffect(() => {
  if (location.state?.highlightOrderId) {
    setHighlightId(location.state.highlightOrderId)
    // clear the state from location to prevent re-triggering
    navigate(location.pathname, { replace: true, state: {} })
  }
  }, []);

  // expand a highlighted order card
  useEffect(() => {
    if (highlightId) {
      setExpandedOrderId(highlightId)
      const timeout = setTimeout(() => setHighlightId(null), 4000)
      return () => clearTimeout(timeout)
    }
  }, [highlightId])

  // initial data load on component mount
  useEffect(() => {
    loadOrders()
  }, [])

// fetches the list of all orders and then fetches detailed information for each one
// page can render quickly with basic info
const loadOrders = async () => {
  try {
    setLoading(true)
    // first, get the basic list of orders
    const data = await listOrders()
    console.log('Loaded orders:', data)
    setOrders(data || [])
    setError(null)

    if (!data || data.length === 0) {
      setOrderDetails({})
      return
    }

    // then, fetch detailed data for each order concurrently
    const detailEntries = await Promise.all(
      data.map(async (order) => {
        try {
          const detail = await getOrder(order.id)
          return [order.id, detail]
        } catch (err) {
          console.error(`[Orders] Failed to load detail for ${order.id}:`, err)
          return null
        }
      })
    )

    // build a dictionary for easy lookup of order details by id
    const detailsObject = {}
    detailEntries.forEach((entry) => {
      if (entry) {
        const [id, detail] = entry
        detailsObject[id] = detail
      }
    })
    setOrderDetails(detailsObject)
  } catch (err) {
    setError('Failed to load your travels')
  } finally {
    setLoading(false)
  }
}


  // format date for display
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

  // toggles the expanded/collapsed state of an order card
  const handleExpand = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId))
    setCancelTarget(null)
  }

  // sets the state to show the swipe to cancel ui for a specific order
  const openCancelPanel = (orderId) => {
    setCancelTarget(orderId)
  }

  // hides the swipe-to-cancel ui
  const handleCancelPanelClose = (orderId) => {
    setCancelTarget(null)
  }


// performs the order cancellation via an api call and reloads the data
const performCancelOrder = async (orderId) => {
  try {
    await cancelOrder(orderId);
    await loadOrders();           
    showNotification('Order cancelled successfully!', 'success');
  } catch (err) {
    console.error('[Orders] Error cancelling order:', err);
    showNotification('Failed to cancel order', 'error');
  } finally {
  setCancelTarget(null);
  }
}


// renders a single order card, including its collapsed and expanded views
const renderOrderCard = (order) => {
  const detail = orderDetails[order.id]
  const offer = detail?.offer

  const status = order.order_status
  const isConfirmed = status === 'CONFIRMED'
  const isCancelled = status === 'CANCELLED'

  const dateRange = offer
    ? `${formatDate(offer.date_from)} - ${formatDate(offer.date_to)}`
    : 'Loading dates...'

  const destinationName = offer?.destination_name || 'Loading destination...'
  const pricePerPerson = detail?.total_price || 0
  const totalPrice = pricePerPerson * order.number_of_people
  const expanded = expandedOrderId === order.id



  return (
  <div
    key={order.id}
    className={`order-card
      ${expanded ? 'expanded' : ''}
      ${highlightId === order.id ? 'highlight' : ''}
      ${status === 'CANCELLED' ? 'cancelled' : ''}
    `}
  >


      <div className="order-card-main" onClick={() => handleExpand(order.id)} role="button">        <div className="order-card-info">
          <span className="order-destination">{destinationName}</span>
          <span className="order-dates">{dateRange}</span>
          <span
            className={`order-status-tag ${
              status === 'CONFIRMED'
                ? 'confirmed'
                : status === 'CANCELLED'
                ? 'cancelled'
                : 'unconfirmed'
            }`}
          >
            {status}
          </span>

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
                event.stopPropagation();
                navigate(`/orders/${order.id}`);
              }}
            >
              View & edit order
            </button>
          </div>

        {!isCancelled && (
          <div className="order-actions" onClick={(event) => event.stopPropagation()}>
            {cancelTarget === order.id ? (
              <SwipeToCancel
                onCancel={() => performCancelOrder(order.id)}
                onBack={handleCancelPanelClose}
                stopSwipePropagation={true}
              />
            ) : (
              <button className="order-delete-button" onClick={() => openCancelPanel(order.id)}>
                Delete
              </button>
            )}
          </div>
        )}

        </div>
      )}
    </div>
  );
};






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
        <Notify message={notify.message} type={notify.type} />

        <div className="orders-container">
          <div className="orders-header">
            <div className="orders-title">your travels</div>
            <button className="orders-back-button" onClick={() => navigate('/explore')}>
              Go back
            </button>
          </div>

          {loading ? (
            <div className="orders-state">Loading travels...</div>
          ) : error ? (
            <div className="orders-state error">{error}</div>
          ) : orders.length === 0 ? (
            <div className="orders-empty">
              You have no chosen travels yet. Accept a destination and confirm it to see it here.
            </div>
          ) : (
            <div className="orders-list-container">
            {orders.some(o => o.order_status === 'CONFIRMED') && (
              <div className="orders-section">
                <h3>Confirmed Travels</h3>
                {orders.filter(o => o.order_status === 'CONFIRMED').map(renderOrderCard)}
              </div>
            )}

            {orders.some(o => o.order_status === 'PENDING') && (
              <div className="orders-section">
                <h3>Unconfirmed Travels</h3>
                {orders.filter(o => o.order_status === 'PENDING').map(renderOrderCard)}
              </div>
            )}

            {cancelledOrders.length > 0 && (
              <div className="orders-section cancelled-section">
                <div className="orders-section-header">
                  <span className="cancelled-title">Cancelled Travels</span>
                  <button
                    className="orders-trash-button"
                    onClick={emptyTrashHandler}
                    disabled={cancelledOrders.length === 0}
                  >
                    🗑 Clear history
                  </button>
                </div>

                {cancelledOrders.map(renderOrderCard)}
              </div>
            )}






            </div>

          )}
        </div>
      </div>
    </>
  )

}

export default OrdersPage
