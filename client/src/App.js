import './App.css';
import { BrowserRouter, Link, Routes, Route, Navigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
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
import AllListings from './AllListings';
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

function getNotificationLastSeenKey(userId) {
  return `notificationsLastSeen_${userId}`;
}

function getApplicantTimestamp(applicant) {
  return applicant?.createdAt ? new Date(applicant.createdAt).getTime() : 0;
}

function Header({ authState, onLogout, notificationRefreshKey }) {
  const [notificationCount, setNotificationCount] = useState(0);
  const supportUser = isSupportUser(authState);
  const loginLink = authState.userId ? (
    <Link to="/Login" onClick={onLogout}>Logout</Link>
  ) : (
    <Link to="/Login">Login</Link>
  );

  useEffect(() => {
    async function fetchNotificationCount() {
      if (!authState.userId || supportUser) {
        setNotificationCount(0);
        return;
      }

      try {
        const lastSeen = Number(localStorage.getItem(getNotificationLastSeenKey(authState.userId)) || 0);
        const [messagesRes, listingsRes] = await Promise.all([
          fetch(`http://localhost:7000/api/messages?receiverId=${encodeURIComponent(authState.userId)}`),
          fetch(`http://localhost:7000/api/listings?createdBy=${encodeURIComponent(authState.userId)}`)
        ]);
        const messages = await messagesRes.json();
        const listings = await listingsRes.json();
        const unreadMessages = (Array.isArray(messages) ? messages : []).filter(message => {
          return new Date(message.createdAt).getTime() > lastSeen;
        }).length;
        const unreadApplications = (Array.isArray(listings) ? listings : []).reduce((total, listing) => {
          return total + (listing.applicants || []).filter(applicant => getApplicantTimestamp(applicant) > lastSeen).length;
        }, 0);

        setNotificationCount(unreadMessages + unreadApplications);
      } catch (error) {
        setNotificationCount(0);
      }
    }

    fetchNotificationCount();
  }, [authState.userId, supportUser, notificationRefreshKey]);

  if (supportUser) {
    return (
      <div className="header">
        <ul>
          <strong><li style={{float: 'left', fontSize: 45}}><Link to="/Tickets">CoHabitat</Link></li></strong>
          <li style={{float: 'left'}}><Link to="/Tickets">Tickets</Link></li>
          <li style={{float: 'left'}}><Link to="/AllUsers">Users</Link></li>
          <li style={{float: 'left'}}><Link to="/AllHouseholds">Households</Link></li>
          <li style={{float: 'left'}}><Link to="/AllListings">Listings</Link></li>
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
        <li>
          <Link to="/Notifications" className="notificationBellLink">
            <img src={require('.//images/bell.png')} className="icon" alt="Notifications"/>
            {notificationCount > 0 && <span className="notificationBadge">{notificationCount > 9 ? "9+" : notificationCount}</span>}
          </Link>
        </li>
        <li><Link to="/Search"><img src={require('.//images/search.png')} className="icon" alt="Search"/></Link></li>
      </ul>
    </div>
  );
}

function App() {
  const [authState, setAuthState] = useState(getAuthState);
  const [notificationRefreshKey, setNotificationRefreshKey] = useState(0);

  const markNotificationsSeen = useCallback(() => {
    setNotificationRefreshKey(key => key + 1);
  }, []);

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
    <Header authState={authState} onLogout={handleLogout} notificationRefreshKey={notificationRefreshKey} />
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
          <Route path = "/Notifications" element = {<UserRoute authState={authState}><Notifications onNotificationsSeen={markNotificationsSeen}/></UserRoute>}/>
          <Route path = "/AdminHome" element = {<SupportRoute authState={authState}><AdminHome/></SupportRoute>}/>
          <Route path = "/AllUsers" element = {<SupportRoute authState={authState}><AllUsers/></SupportRoute>}/>
          <Route path = "/Tickets" element = {<SupportRoute authState={authState}><Tickets/></SupportRoute>}/>
          <Route path = "/AllHouseholds" element = {<SupportRoute authState={authState}><AllHouseholds/></SupportRoute>}/>
          <Route path = "/AllListings" element = {<SupportRoute authState={authState}><AllListings/></SupportRoute>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
