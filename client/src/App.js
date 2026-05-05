import './App.css';
import { BrowserRouter, Link, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
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
import Messages from './Messages';
import Notifications from './Notifications';

const SUPPORT_EMAIL = "support@gmail.com";

function getAuthState() {
  return {
    userId: localStorage.getItem("userId") || "",
    userEmail: localStorage.getItem("userEmail") || ""
  };
}

function isSupportUser(authState) {
  return authState.userEmail.toLowerCase() === SUPPORT_EMAIL;
}

function UserRoute({ children, authState }) {
  if (!authState.userId) return <Navigate to="/Login" />;
  if (isSupportUser(authState)) return <Navigate to="/Tickets" />;
  return children;
}

function SupportRoute({ children, authState }) {
  if (!authState.userId) return <Navigate to="/Login" />;
  if (!isSupportUser(authState)) return <Navigate to="/" />;
  return children;
}

function Header({ authState, onLogout }) {
  const supportUser = isSupportUser(authState);
  const loginLink = authState.userId ? (
    <Link to="/Login" onClick={onLogout}>Logout</Link>
  ) : (
    <Link to="/Login">Login</Link>
  );

  if (supportUser) {
    return (
      <div className="header">
        <ul>
          <strong><li style={{float: 'left', fontSize: 45}}><Link to="/Tickets">CoHabitat</Link></li></strong>
          <li style={{float: 'left'}}><Link to="/Tickets">Tickets</Link></li>
          <li style={{float: 'left'}}><Link to="/AllUsers">Users</Link></li>
          <li style={{float: 'left'}}><Link to="/AllHouseholds">Households</Link></li>
          <li style={{fontSize: 45}}>{loginLink}</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="header">
      <ul>
        <strong><li style={{float: 'left', fontSize: 45}}><Link to="/">CoHabitat</Link></li></strong>
        <li style={{float: 'left'}}><Link to="/"><img src={require('.//images/homeIcon.png')} className="icon" alt="Home"/></Link></li>
        <li style={{fontSize: 45}}>{loginLink}</li>
        <li><Link to="/Messages"><img src={require('.//images/dm.png')} className="icon" alt="Messages"/></Link></li>
        <li><Link to="/Notifications"><img src={require('.//images/bell.png')} className="icon" alt="Notifications"/></Link></li>
        <li><Link to="/Search"><img src={require('.//images/search.png')} className="icon" alt="Search"/></Link></li>
      </ul>
    </div>
  );
}

function App() {
  const [authState, setAuthState] = useState(getAuthState);

  function refreshAuthState() {
    setAuthState(getAuthState());
  }

  function handleLogout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("householdId");
    refreshAuthState();
  }

  return (
    <BrowserRouter>
    <Header authState={authState} onLogout={handleLogout} />
      <Routes>
          <Route path = "/Login" element = {<Login onLogin={refreshAuthState}/>}/>
          <Route path = "/Signup" element = {<Signup/>}/>
          <Route path = "/" element = {<UserRoute authState={authState}><Home/></UserRoute>}/>
          <Route path = "/Search" element = {<UserRoute authState={authState}><Search/></UserRoute>}/>
          <Route path = "/Roommates" element = {<UserRoute authState={authState}><Roommates/></UserRoute>}/>
          <Route path = "/Bills" element = {<UserRoute authState={authState}><Bills/></UserRoute>}/>
          <Route path = "/Calendar" element = {<UserRoute authState={authState}><Calendar/></UserRoute>}/>
          <Route path = "/Lists" element = {<UserRoute authState={authState}><Lists/></UserRoute>}/>
          <Route path = "/List" element = {<UserRoute authState={authState}><List/></UserRoute>}/>
          <Route path = "/Settings" element = {<UserRoute authState={authState}><Settings/></UserRoute>}/>
          <Route path = "/ApartmentListing" element = {<UserRoute authState={authState}><ApartmentListing/></UserRoute>}/>
          <Route path = "/Apartment" element = {<UserRoute authState={authState}><Apartment/></UserRoute>}/>
          <Route path = "/TenantProfile" element = {<UserRoute authState={authState}><TenantProfile/></UserRoute>}/>
          <Route path = "/SubmitTicket" element = {<UserRoute authState={authState}><SubmitTicket/></UserRoute>}/>
          <Route path = "/Messages" element = {<UserRoute authState={authState}><Messages/></UserRoute>}/>
          <Route path = "/Notifications" element = {<UserRoute authState={authState}><Notifications/></UserRoute>}/>
          <Route path = "/AdminHome" element = {<SupportRoute authState={authState}><AdminHome/></SupportRoute>}/>
          <Route path = "/AllUsers" element = {<SupportRoute authState={authState}><AllUsers/></SupportRoute>}/>
          <Route path = "/Tickets" element = {<SupportRoute authState={authState}><Tickets/></SupportRoute>}/>
          <Route path = "/AllHouseholds" element = {<SupportRoute authState={authState}><AllHouseholds/></SupportRoute>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
