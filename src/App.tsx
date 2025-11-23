import './App.css';
import { Routes, Route } from 'react-router';
import Playground from "./playground/Playground.tsx";

function App() {
  return (
    <Routes>
      <Route path="/playground" element= <Playground/> />
    </Routes>
  )
}

export default App
