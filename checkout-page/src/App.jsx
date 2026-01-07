import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Failure from './pages/Failure';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
        <Route path="/" element={<Checkout />} />
                <Route path="/failure" element={<Failure />} />
      </Routes>
    </Router>
  );
}

export default App;
