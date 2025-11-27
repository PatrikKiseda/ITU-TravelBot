const API_BASE_URL = '/api/v1'

// Helper function to get session ID from cookies
// Note: The backend middleware automatically creates a session ID if none exists
// We don't need to create one here - just let the backend handle it
function getSessionId() {
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'sessionId') {
      return value
    }
  }
  // Return null - backend will create one via middleware
  return null
}

async function apiRequest(endpoint, options = {}) {
  try {
    console.log(`[API] Requesting: ${API_BASE_URL}${endpoint}`)
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    })

    console.log(`[API] Response status: ${response.status}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[API] Error response:', errorData)
      throw new Error(errorData.error?.message || `API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('[API] Response data:', data)
    
    if (data.error) {
      throw new Error(data.error.message || 'API error')
    }

    return data.data
  } catch (error) {
    console.error('[API] Request failed:', error)
    throw error
  }
}

export async function fetchAcceptedOffers(sort = 'price', order = 'asc') {
  const params = new URLSearchParams({ sort, order })
  return apiRequest(`/customer/accepted?${params}`)
}

export async function fetchExpandedOffer(offerId) {
  return apiRequest(`/customer/accepted/${offerId}/expand`)
}

export async function deleteOffer(offerId) {
  // TODO: Implement when delete endpoint is available
  return apiRequest(`/customer/accepted/${offerId}`, {
    method: 'DELETE',
  })
}

export async function fetchAvailableOffers() {
  return apiRequest(`/customer/offers`)
}

export async function acceptOffer(offerId) {
  return apiRequest(`/customer/offers/${offerId}/accept`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function rejectOffer(offerId) {
  return apiRequest(`/customer/offers/${offerId}/reject`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function fetchAllOffersWithStatus(filters = {}) {
  const params = new URLSearchParams()
  if (filters.origin) params.append('origin', filters.origin)
  if (filters.destination) params.append('destination', filters.destination)
  if (filters.season) params.append('season', filters.season)
  if (filters.typeOfStay) params.append('type_of_stay', filters.typeOfStay)
  if (filters.priceMin !== undefined) params.append('price_min', filters.priceMin)
  if (filters.priceMax !== undefined) params.append('price_max', filters.priceMax)
  if (filters.statusFilter) params.append('status_filter', filters.statusFilter)
  if (filters.sort) params.append('sort', filters.sort)
  if (filters.order) params.append('order', filters.order)
  const queryString = params.toString()
  return apiRequest(`/customer/offers/all${queryString ? '?' + queryString : ''}`)
}

export async function updateOfferStatus(offerId, status) {
  return apiRequest(`/customer/offers/${offerId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

export async function addNote(offerId, noteText) {
  const res = await fetch(`/api/v1/customer/accepted/${offerId}/note`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ note_text: noteText }),
  });
  if (!res.ok) throw new Error(`Failed to save note: ${res.status}`);
  const data = await res.json();
  return data?.data || data;
}

export async function updateNote(offerId, noteText) {
  const res = await fetch(`/api/v1/customer/accepted/${offerId}/note`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ note_text: noteText }),
  });
  if (!res.ok) throw new Error(`Failed to update note: ${res.status}`);
  const data = await res.json();
  return data?.data || data;
}

export async function getNote(offerId) {  // renamed
  const res = await fetch(`/api/v1/customer/accepted/${offerId}/note`, {
    credentials: 'include',
  })
  if (res.status === 404) {
    return ''
  }
  if (!res.ok) {
    throw new Error(`Failed to load note: ${res.status}`)
  }
  const data = await res.json()
  return data?.data?.note_text || data?.note_text || ''
}

export async function confirmTravel(offerId, numberOfPeople, transportMode) {
  return apiRequest(`/customer/accepted/${offerId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({
      number_of_people: numberOfPeople,
      selected_transport_mode: transportMode,
    }),
  })
}

export async function getOrder(orderId) {
  return apiRequest(`/customer/orders/${orderId}`)
}

export async function updateOrder(orderId, numberOfPeople, transportMode) {
  return apiRequest(`/customer/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({
      number_of_people: numberOfPeople,
      selected_transport_mode: transportMode,
    }),
  })
}

export async function confirmOrder(orderId) {
  return apiRequest(`/customer/orders/${orderId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function listOrders(status) {
  const params = status ? `?status=${encodeURIComponent(status)}` : ''
  return apiRequest(`/customer/orders${params}`)
}

export async function cancelOrder(orderId) {
  return apiRequest(`/customer/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}
