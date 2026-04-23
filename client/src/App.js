import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import Home from "./Home"
import Search from './Search';
import Login from './Login';
import Signup from './Signup';
import Roommates from './Roommates';
import Bills from './Bills';
import Calendar from './Calendar';
import Lists from './Lists';
import List from './List';
import Settings from './Settings';
import ApartmentListing from './ApartmentListing';
import Apartment from './Apartment';

function App() {
  return (
    <BrowserRouter>
    <div class = "header">
      <ul>
        <strong><li style={{float: 'left', fontSize: 45}}><Link to = "/">CoHabitat</Link></li></strong>
        <li style={{float: 'left'}}><Link to = "/"><img src={require('.//images/homeIcon.png')} class = "icon"></img></Link></li>
        <li style={{fontSize: 45}}><Link to = "/Login">Login</Link></li> {/* Have it change to profile icon/user image when signed in*/}
        <li><a><img src={require('.//images/dm.png')} class = "icon"/></a></li>
        <li><a><img src={require('.//images/bell.png')} class = "icon"/></a></li>
        <li><Link to="/Search"><img src={require('.//images/search.png')} class = "icon"/></Link></li>
      </ul>
    </div>
      <Routes>
          <Route path = "/" element = {<Home/>}/>
          <Route path = "/Search" element = {<Search/>}/>
          <Route path = "/Login" element = {<Login/>}/>
          <Route path = "/Signup" element = {<Signup/>}/>
          <Route path = "/Roommates" element = {<Roommates/>}/>
          <Route path = "/Bills" element = {<Bills/>}/>
          <Route path = "/Calendar" element = {<Calendar/>}/>
          <Route path = "/Lists" element = {<Lists/>}/>
          <Route path = "/List" element = {<List/>}/>
          <Route path = "/Settings" element = {<Settings/>}/>
          <Route path = "/ApartmentListing" element = {<ApartmentListing/>}/>
          <Route path = "/Apartment" element = {<Apartment/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
