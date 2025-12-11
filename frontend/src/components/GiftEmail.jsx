import React from 'react'
import './GiftEmail.css'

function GiftEmail({ offer, giftData, onChange }) {
  const handleChange = (field, value) => {
    onChange({
      ...giftData,
      [field]: value
    })
  }

  return (
    <div className="gift-email-container">
      <div className="gift-email-header">
        <div className="gift-email-field">
          <label className="gift-email-label">To:</label>
          <input
            type="email"
            className="gift-email-input"
            value={giftData.recipientEmail || ''}
            onChange={(e) => handleChange('recipientEmail', e.target.value)}
            placeholder="recipient@example.com"
          />
        </div>
        <div className="gift-email-field">
          <label className="gift-email-label">Subject:</label>
          <div className="gift-email-subject-display">
            {giftData.subject || "You've been gifted a trip!"}
          </div>
        </div>
      </div>
      <div className="gift-email-body">
        <div className="gift-email-body-content">
          <div className="gift-email-greeting">
            Dear{' '}
            <input
              type="text"
              className="gift-email-inline-input"
              value={giftData.recipientName || ''}
              onChange={(e) => handleChange('recipientName', e.target.value)}
              placeholder="[Recipient Name]"
              required
            />
            ,
          </div>
          
          <div className="gift-email-trip-section">
            <p>You have been gifted this trip:</p>
            <div className="gift-email-trip-details">
              {offer.image_url && (
                <img src={offer.image_url} alt={offer.destination_name} className="gift-email-trip-image" />
              )}
              <div className="gift-email-trip-info">
                <h3 className="gift-email-trip-title">{offer.destination_name}</h3>
                {offer.extended_description && (
                  <p className="gift-email-trip-description">{offer.extended_description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="gift-email-note-section">
            <textarea
              className="gift-email-note-input"
              value={giftData.note || ''}
              onChange={(e) => handleChange('note', e.target.value)}
              placeholder="Add your personal message here..."
              rows="4"
            />
          </div>

          <div className="gift-email-signature">
            <div>
              Signed{' '}
              <input
                type="text"
                className="gift-email-inline-input"
                value={giftData.senderName || ''}
                onChange={(e) => handleChange('senderName', e.target.value)}
                placeholder="[Your Name]"
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GiftEmail

