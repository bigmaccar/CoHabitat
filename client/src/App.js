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
import Messages from './Messages';

const SUPPORT_EMAIL = "support@gmail.com";

function isSupportUser() {
  return (localStorage.getItem("userEmail") || "").toLowerCase() === SUPPORT_EMAIL;
}

function UserRoute({ children }) {
  const userId = localStorage.getItem("userId");
  if (!userId) return <Navigate to="/Login" />;
  if (isSupportUser()) return <Navigate to="/Tickets" />;
  return children;
}

function SupportRoute({ children }) {
  const userId = localStorage.getItem("userId");
  if (!userId) return <Navigate to="/Login" />;
  if (!isSupportUser()) return <Navigate to="/" />;
  return children;
}

function Header() {
  const supportUser = isSupportUser();

  if (supportUser) {
    return (
      <div className="header">
        <ul>
          <strong><li style={{float: 'left', fontSize: 45}}><Link to="/Tickets">CoHabitat</Link></li></strong>
          <li style={{float: 'left'}}><Link to="/Tickets">Tickets</Link></li>
          <li style={{float: 'left'}}><Link to="/AllUsers">Users</Link></li>
          <li style={{float: 'left'}}><Link to="/AllHouseholds">Households</Link></li>
          <li style={{fontSize: 45}}><Link to="/Login">Login</Link></li>
        </ul>
      </div>
    );
  }

  return (
    <div className="header">
      <ul>
        <strong><li style={{float: 'left', fontSize: 45}}><Link to="/">CoHabitat</Link></li></strong>
        <li style={{float: 'left'}}><Link to="/"><img src={require('.//images/homeIcon.png')} className="icon" alt="Home"/></Link></li>
        <li style={{fontSize: 45}}><Link to="/Login">Login</Link></li>
        <li><Link to="/Messages"><img src={require('.//images/dm.png')} className="icon" alt="Messages"/></Link></li>
        <li><span><img src={require('.//images/bell.png')} className="icon" alt="Notifications"/></span></li>
        <li><Link to="/Search"><img src={require('.//images/search.png')} className="icon" alt="Search"/></Link></li>
      </ul>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
    <Header />
      <Routes>
          <Route path = "/Login" element = {<Login/>}/>
          <Route path = "/Signup" element = {<Signup/>}/>
          <Route path = "/" element = {<UserRoute><Home/></UserRoute>}/>
          <Route path = "/Search" element = {<UserRoute><Search/></UserRoute>}/>
          <Route path = "/Roommates" element = {<UserRoute><Roommates/></UserRoute>}/>
          <Route path = "/Bills" element = {<UserRoute><Bills/></UserRoute>}/>
          <Route path = "/Calendar" element = {<UserRoute><Calendar/></UserRoute>}/>
          <Route path = "/Lists" element = {<UserRoute><Lists/></UserRoute>}/>
          <Route path = "/List" element = {<UserRoute><List/></UserRoute>}/>
          <Route path = "/Settings" element = {<UserRoute><Settings/></UserRoute>}/>
          <Route path = "/ApartmentListing" element = {<UserRoute><ApartmentListing/></UserRoute>}/>
          <Route path = "/Apartment" element = {<UserRoute><Apartment/></UserRoute>}/>
          <Route path = "/TenantProfile" element = {<UserRoute><TenantProfile/></UserRoute>}/>
          <Route path = "/SubmitTicket" element = {<UserRoute><SubmitTicket/></UserRoute>}/>
          <Route path = "/Messages" element = {<UserRoute><Messages/></UserRoute>}/>
          <Route path = "/AdminHome" element = {<SupportRoute><AdminHome/></SupportRoute>}/>
          <Route path = "/AllUsers" element = {<SupportRoute><AllUsers/></SupportRoute>}/>
          <Route path = "/Tickets" element = {<SupportRoute><Tickets/></SupportRoute>}/>
          <Route path = "/AllHouseholds" element = {<SupportRoute><AllHouseholds/></SupportRoute>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
