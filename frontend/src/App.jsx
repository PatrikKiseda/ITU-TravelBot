import React, { useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'
import Header from './components/Header'
import Explore from './pages/Explore'
import Compare from './pages/Compare'
import Orders from './pages/Orders'
import OrderDetail from './pages/Order'
import Admin from './pages/Admin'
import './App.css'

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [filters, setFilters] = useState({
    statusFilter: null,
    priceRange: [0, 10000],
    season: null,
    typeOfStay: null,
    origin: null,
    destination: null,
  })
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
  const [comparingOffers, setComparingOffers] = useState(new Set())

  const swipeHandlers = useSwipeable({
    onSwipedLeft: (e) => {
      // Block navigation if swiping on cards
      const target = e.event.target
      if (target.closest('.explore-offer-card') ||
          target.closest('.comparison-card') ||
          target.closest('.order-card')) {
        return
      }

      // Allow navigation when swiping on filter area, header, or empty space in explore
      const filterBar = target.closest('.filter-bar')
      const headerFilters = target.closest('.header-filters')
      const header = target.closest('.header')

      if (location.pathname === '/explore' && (filterBar || headerFilters || header)) {
        navigate('/orders')
      }
    },
    onSwipedRight: (e) => {
      // Block navigation if swiping on cards
      const target = e.event.target
      if (target.closest('.explore-offer-card') ||
          target.closest('.comparison-card')) {
        return
      }

      // Allow navigation when swiping on header or orders page area
      const header = target.closest('.header')
      const ordersPage = target.closest('.orders-page')
      const ordersContainer = target.closest('.orders-container')

      if ((location.pathname === '/orders' || location.pathname.startsWith('/orders/')) &&
          (header || ordersPage || ordersContainer)) {
        navigate('/explore')
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: false,
    delta: 50, // Minimum swipe distance
  })

  return (
    <div className="app" {...swipeHandlers}>
      <link href="https://fonts.googleapis.com/css2?family=Gurajada&display=swap" rel="stylesheet"></link>
      <Routes>
        <Route path="/" element={<Navigate to="/explore" replace />} />
        <Route path="/explore" element={
          <Explore
            filters={filters}
            onFiltersChange={setFilters}
            onPriceRangeChange={setPriceRange}
            comparingOffers={comparingOffers}
            setComparingOffers={setComparingOffers}
          />
        } />
        <Route path="/compare" element={
          <Compare
            filters={filters}
            comparingOffers={comparingOffers}
          />
        } />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderId" element={<OrderDetail />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  )
}

function App() {
  return <AppContent />
}

export default App
