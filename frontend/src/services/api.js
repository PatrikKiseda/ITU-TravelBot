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

export async function deleteOfferPermanent(offerId) {
  return apiRequest(`/agent/offers/${offerId}`, {
    method: 'DELETE',
  })
}

// export async function updateOffer(offerId,offer) {
//   console.log(offer)
//   return apiRequest(`/agent/offers/${offerId}`, {
//     method: 'PUT',
//     body: JSON.stringify({
//       date_from: offer.date_from,
//       date_to: offer.date_to,
//       price_transport_mode: offer.price_transport_mode,
//       destination_name: offer.destination_name,
//       capacity_total: offer.capacity_total,
//       season: offer.season,
//       country: offer.country,
//       city: offer.city,
//       origin: offer.origin,
//       destination_where_to: offer.destination_where_to,
//       // type_of_stay: JSON.stringify(offer.type_of_stay),
//       price_housing: offer.price_housing,
//       price_food: offer.price_food,
//       price_transport_amount: offer.price_transport_amount,
//       short_description: offer.short_description,
//       extended_description: offer.extended_description,
//       image_url: offer.image_url,
//     }),
//   })
// }

export async function updateOffer(offerId, updates) {
  return apiRequest(`/agent/offers/${offerId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  })
}

export async function fetchOfferById(offerId) {
  return apiRequest(`/agent/offers/${offerId}`)
}

export async function fetchAvailableOffers() {
  return apiRequest(`/customer/offers`)
}


export async function fetchAllAvailableTags() {
  return apiRequest('/tags')
}

export async function fetchTags(offerId) {
  return apiRequest(`/offers/${offerId}/tags`)
}

export async function addTagToOffer(offerId, tagId) {
  return apiRequest(`/offers/${offerId}/tags/${tagId}`, {
    method: 'POST',
    body: JSON.stringify({})
  })
}

export async function createTag(tagBody) {
  return apiRequest(`/tags`, {
    method: 'POST',
    body: JSON.stringify(tagBody)
  })
}

export async function removeTagFromOffer(offerId, tagId) {
  return apiRequest(`/offers/${offerId}/tags/${tagId}`, {
    method: 'DELETE'
  })
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

export async function addNote(offerId, noteText) {
  const res = await fetch(`/api/v1/customer/accepted/${offerId}/note`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note_text: noteText }),
  });
  if (!res.ok) throw new Error(`Failed to save note: ${res.status}`);
  const data = await res.json();
  return data?.data || data;
}

export async function getNote(offerId) {  // renamed
  const res = await fetch(`/api/v1/customer/accepted/${offerId}/note`);
  if (!res.ok) throw new Error(`Failed to load note: ${res.status}`);
  const data = await res.json();
  return data?.data?.note_text || data?.note_text || '';
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
