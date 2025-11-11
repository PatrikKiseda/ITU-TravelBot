import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Plan from './pages/Plan'
import Explore from './pages/Explore'
import Orders from './pages/Orders'
import OrderDetail from './pages/Order'
import './App.css'

function App() {
  return (
    <div className="app">
      <link href="https://fonts.googleapis.com/css2?family=Gurajada&display=swap" rel="stylesheet"></link>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/explore" replace />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderId" element={<OrderDetail />} />
      </Routes>
    </div>
  )
}

export default App
