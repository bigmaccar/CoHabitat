import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Link, Routes, Route, Navigate } from 'react-router-dom';
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
import TenantProfile from './TenantProfile';
import AdminHome from './AdminHome';
import Tickets from './Tickets';
import AllUsers from './AllUsers';
import AllHouseholds from './AllHouseholds';
import SubmitTicket from './SubmitTicket';

function ProtectedRoute({ children }) {
  const userId = localStorage.getItem("userId");
  if (!userId) return <Navigate to="/Login" />;
  return children;
}

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
          <Route path = "/Login" element = {<Login/>}/>
          <Route path = "/Signup" element = {<Signup/>}/>
          <Route path = "/" element = {<ProtectedRoute><Home/></ProtectedRoute>}/>
          <Route path = "/Search" element = {<ProtectedRoute><Search/></ProtectedRoute>}/>
          <Route path = "/Roommates" element = {<ProtectedRoute><Roommates/></ProtectedRoute>}/>
          <Route path = "/Bills" element = {<ProtectedRoute><Bills/></ProtectedRoute>}/>
          <Route path = "/Calendar" element = {<ProtectedRoute><Calendar/></ProtectedRoute>}/>
          <Route path = "/Lists" element = {<ProtectedRoute><Lists/></ProtectedRoute>}/>
          <Route path = "/List" element = {<ProtectedRoute><List/></ProtectedRoute>}/>
          <Route path = "/Settings" element = {<ProtectedRoute><Settings/></ProtectedRoute>}/>
          <Route path = "/ApartmentListing" element = {<ProtectedRoute><ApartmentListing/></ProtectedRoute>}/>
          <Route path = "/Apartment" element = {<ProtectedRoute><Apartment/></ProtectedRoute>}/>
          <Route path = "/TenantProfile" element = {<ProtectedRoute><TenantProfile/></ProtectedRoute>}/>
          <Route path = "/AdminHome" element = {<ProtectedRoute><AdminHome/></ProtectedRoute>}/>
          <Route path = "/AllUsers" element = {<ProtectedRoute><AllUsers/></ProtectedRoute>}/>
          <Route path = "/Tickets" element = {<ProtectedRoute><Tickets/></ProtectedRoute>}/>
          <Route path = "/AllHouseholds" element = {<ProtectedRoute><AllHouseholds/></ProtectedRoute>}/>
          <Route path = "/SubmitTicket" element = {<ProtectedRoute><SubmitTicket/></ProtectedRoute>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
