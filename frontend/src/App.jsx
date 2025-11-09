import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Plan from './pages/Plan'
import Explore from './pages/Explore'
import Order from './pages/Order'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/explore" replace />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/orders/:orderId" element={<Order />} />
      </Routes>
    </div>
  )
}

export default App
