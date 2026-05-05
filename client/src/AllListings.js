import { Link } from "react-router-dom";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:7000/api";

function AllListings(){
    const supportUserId = localStorage.getItem("userId");
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const fetchData = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE}/listings`);
            setListings(Array.isArray(res.data) ? res.data : []);
            setError("");
        } catch (err) {
            setError(err.response?.data?.errorMessage || "Listings could not be loaded.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    function updateListingInState(updatedListing) {
        setListings(currentListings => currentListings.map(listing => listing._id === updatedListing._id ? updatedListing : listing));
    }

    async function toggleActive(listing) {
        try {
            const nextActive = !listing.isActive;
            const res = await axios.put(`${API_BASE}/update/listing/${listing._id}`, {
                isActive: nextActive
            });
            updateListingInState(res.data);
            setStatusMessage(nextActive ? "Listing activated." : "Listing deactivated.");
        } catch (err) {
            setStatusMessage(err.response?.data?.errorMessage || "Listing status could not be updated.");
        }
    }

    async function deleteListing(listing) {
        if (!window.confirm(`Delete ${listing.apartmentName || "this listing"}?`)) {
            return;
        }
        try {
            await axios.delete(`${API_BASE}/delete/listing/${listing._id}`);
            setListings(currentListings => currentListings.filter(item => item._id !== listing._id));
            setStatusMessage("Listing deleted.");
        } catch (err) {
            setStatusMessage(err.response?.data?.errorMessage || "Listing could not be deleted.");
        }
    }

    return (
        <section className="layout">
            <div className="leftSide">
                <div className="sidebar">
                    <center><ul>
                        <li><Link to="/Tickets"><figure><img src={require("./images/list.png")} className="icon" alt="Tickets"/><figcaption>Tickets</figcaption></figure></Link></li>
                        <li><Link to="/AllHouseholds"><figure><img src={require("./images/homeIcon.png")} className="icon" alt="Households"/><figcaption>Households</figcaption></figure></Link></li>
                        <li><Link to="/AllUsers"><figure><img src={require("./images/roommates.png")} className="icon" alt="Users"/><figcaption>Users</figcaption></figure></Link></li>
                        <li className="active"><Link to="/AllListings"><figure><img src={require("./images/bill.png")} className="icon" alt="Listings"/><figcaption>Listings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body adminPage">
                <h1>All Listings</h1>
                {loading && <p>Loading listings...</p>}
                {error && <p style={{color: "red"}}>{error}</p>}
                {statusMessage && <p>{statusMessage}</p>}
                {!loading && !error && listings.length === 0 && <p>No listings found.</p>}
                <ul className="adminCardList">
                    {listings.map(listing => {
                        return (
                            <li className="adminCard" key={listing._id}>
                                <div className="adminCardHeader">
                                    <div>
                                        <h2>{listing.apartmentName || "Unnamed listing"}</h2>
                                        <p>ID: {listing._id}</p>
                                    </div>
                                    <span className={listing.isActive ? "statusPill" : "statusPill warning"}>
                                        {listing.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <pre style={{backgroundColor: "#f5f5f5", padding: "12px", borderRadius: "6px", overflow: "auto", fontSize: "12px"}}>
                                    {JSON.stringify(listing, null, 2)}
                                </pre>
                                <div className="adminActions">
                                    <button className={listing.isActive ? "btnRed" : "btnOutline"} onClick={() => toggleActive(listing)}>
                                        {listing.isActive ? "Deactivate" : "Activate"}
                                    </button>
                                    <button className="btnRed" onClick={() => deleteListing(listing)}>Delete</button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

export default AllListings;
