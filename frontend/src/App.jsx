import React, { useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'
import Header from './components/Header'
import Explore from './pages/Explore'
import Compare from './pages/Compare'
import Orders from './pages/Orders'
import OrderDetail from './pages/Order'
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
      // #region agent log
      const target = e.event.target
      const isSlider = target.closest('.price-slider') || target.closest('.price-slider-container')
      const isCard = target.closest('.explore-offer-card') || target.closest('.comparison-card') || target.closest('.order-card')
      const filterBar = target.closest('.filter-bar')
      fetch('http://127.0.0.1:7242/ingest/c9197bf8-d599-4857-821f-99bbf4911463',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:onSwipedLeft',message:'Swipe left detected',data:{isSlider:!!isSlider,isCard:!!isCard,isFilterBar:!!filterBar,pathname:location.pathname,targetClass:target.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Block navigation if swiping on cards
      if (isCard) {
        return
      }
      
      // Block navigation if swiping on slider
      if (isSlider) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c9197bf8-d599-4857-821f-99bbf4911463',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:onSwipedLeft-blocked',message:'Navigation blocked - slider detected',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return
      }
      
      // Allow navigation when swiping on filter area, header, or empty space in explore
      const headerFilters = target.closest('.header-filters')
      const header = target.closest('.header')
      
      if (location.pathname === '/explore' && (filterBar || headerFilters || header)) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c9197bf8-d599-4857-821f-99bbf4911463',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:onSwipedLeft-navigate',message:'Navigating to orders',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
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
      </Routes>
    </div>
  )
}

function App() {
  return <AppContent />
}

export default App
