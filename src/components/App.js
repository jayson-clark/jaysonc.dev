import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import '../styles/main.css';

import NavMenu from './root/NavMenu';
import BackgroundCanvas from './root/BackgroundCanvas';

import Home from './pages/Home';
import Projects from './pages/Projects';

const App = () => <BrowserRouter>
  <NavMenu />
  <BackgroundCanvas />

  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/projects" element={<Projects />} />
  </Routes>

</BrowserRouter>;


export default App;