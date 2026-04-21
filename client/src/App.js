import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import Home from "./Home"
import Search from './Search';
import Login from './Login';
import Signup from './Signup';

function App() {
  return (
    <BrowserRouter>
    <div class = "header">
      <ul>
        <strong><li style={{float: 'left', fontSize: 20}}><Link to = "/">CoHabitat</Link></li></strong>
        <li><Link to = "/Login">PROFILE PLACEHOLDER</Link></li>
        <li><a>DM PLACEHOLDER</a></li>
        <li><a>NOTIFICATION PLACEHOLDER</a></li>
        <li><Link to="/Search">SEARCH PLACEHOLDER</Link></li>
      </ul>
    </div>
      <Routes>
          <Route path = "/" element = {<Home/>}/>
          <Route path = "/Search" element = {<Search/>}/>
          <Route path = "/Login" element = {<Login/>}/>
          <Route path = "/Signup" element = {<Signup/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
