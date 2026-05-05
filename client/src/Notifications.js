import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

function hasMatchingTag(userTags, listingTags) {
    const normalizedUserTags = (userTags || []).map(tag => String(tag).toLowerCase());
    return (listingTags || []).some(tag => normalizedUserTags.includes(String(tag).toLowerCase()));
}

function matchesUser(user, listing) {
    const preferredLocation = String(user.preferredLocation || "").toLowerCase();
    const listingLocation = String(listing.location || `${listing.city || ""}, ${listing.state || ""}`).toLowerCase();
    const locationMatches = !preferredLocation || listingLocation.includes(preferredLocation.split(",")[0].trim());
    const budgetMatches = !user.budgetMax || !listing.rentAmount || Number(listing.rentAmount) <= Number(user.budgetMax);
    const tagMatches = !user.lifestyleTags?.length || hasMatchingTag(user.lifestyleTags, listing.lifestyleTags);
    return listing.isActive !== false && locationMatches && budgetMatches && tagMatches;
}

function Notifications() {
    const userId = localStorage.getItem("userId");
    const [matches, setMatches] = useState([]);
    const [message, setMessage] = useState("Loading notifications...");

    useEffect(() => {
        async function fetchNotifications() {
            if (!userId) {
                setMessage("Log in to view listing notifications.");
                return;
            }

            try {
                const [userRes, listingsRes] = await Promise.all([
                    axios.get("http://localhost:7000/api/user", { params: { id: userId } }),
                    axios.get("http://localhost:7000/api/listings", { params: { isActive: true } })
                ]);
                const user = userRes.data;
                const listings = Array.isArray(listingsRes.data) ? listingsRes.data : [];
                const matchingListings = listings.filter(listing => {
                    return String(listing.createdBy || "") !== String(userId) && matchesUser(user, listing);
                });
                setMatches(matchingListings);
                setMessage(matchingListings.length ? "" : "No new matching listings right now.");
            } catch (err) {
                setMessage(err.response?.data?.message || "Notifications could not be loaded.");
            }
        }

        fetchNotifications();
    }, [userId]);

    return (
        <section className="messagePage">
            <h1>Notifications</h1>
            {message && <p>{message}</p>}
            {matches.map(listing => (
                <div className="messageCard" key={listing._id}>
                    <h2>{listing.apartmentName}</h2>
                    <p>{listing.location || [listing.city, listing.state].filter(Boolean).join(", ")}</p>
                    <p>${listing.rentAmount}/month</p>
                    {listing.lifestyleTags?.length > 0 && <p>Matches your lifestyle tags: {listing.lifestyleTags.join(", ")}</p>}
                    <Link to={`/Apartment?id=${listing._id}`}>View Listing</Link>
                </div>
            ))}
        </section>
    );
}

export default Notifications;
