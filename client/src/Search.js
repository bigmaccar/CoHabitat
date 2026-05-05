import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getListingMatchDetails } from "./matching";

const fallbackImage = require("./images/apartment1.jpg");

function getListingKey(listing) {
    return listing.listingKey || listing._id;
}

function getListingImage(listing) {
    if (Array.isArray(listing.photos) && listing.photos.length > 0 && listing.photos[0].url) {
        return listing.photos[0].url;
    }
    return fallbackImage;
}

function formatRent(rentAmount) {
    if (!rentAmount && rentAmount !== 0) {
        return "Rent not listed";
    }
    return `$${rentAmount}/month`;
}

function Search(){
    const [listings, setListings] = useState([]);
    const [savedListings, setSavedListings] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [ownersById, setOwnersById] = useState({});
    const [searchText, setSearchText] = useState("");
    const [maxRent, setMaxRent] = useState("");
    const [tagFilter, setTagFilter] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchListings();
        fetchSavedListings();
        fetchMatchContext();
    }, []);

    async function fetchListings() {
        try {
            const res = await axios.get("http://localhost:7000/api/listings", {
                params: { isActive: true }
            });
            setListings(Array.isArray(res.data) ? res.data : []);
            setMessage("");
        } catch (err) {
            setMessage(err.response?.data?.errorMessage || "Listings could not be loaded.");
        } finally {
            setLoading(false);
        }
    }

    async function fetchSavedListings() {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            return;
        }

        try {
            const res = await axios.get("http://localhost:7000/api/savedListings", {
                params: { userId }
            });
            setSavedListings(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setMessage(err.response?.data?.errorMessage || "Saved listings could not be loaded.");
        }
    }

    async function fetchMatchContext() {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            return;
        }

        try {
            const [userRes, usersRes] = await Promise.all([
                axios.get("http://localhost:7000/api/user", { params: { id: userId } }),
                axios.get("http://localhost:7000/api/users")
            ]);
            const users = Array.isArray(usersRes.data) ? usersRes.data : [];
            setCurrentUser(userRes.data);
            setOwnersById(users.reduce((owners, user) => {
                owners[String(user._id)] = user;
                return owners;
            }, {}));
        } catch (err) {
            setCurrentUser(null);
            setOwnersById({});
        }
    }

    async function toggleSavedListing(listing) {
        const userId = localStorage.getItem("userId");
        const listingKey = getListingKey(listing);
        if (!userId) {
            setMessage("You must be logged in to save listings.");
            return;
        }

        try {
            if (savedListings.some(savedListing => savedListing.listingKey === listingKey)) {
                await axios.delete("http://localhost:7000/api/delete/savedListing/" + listingKey, {
                    params: {
                        userId,
                        listingKey
                    }
                });
                setMessage("Listing removed from saved listings.");
            } else {
                await axios.post("http://localhost:7000/api/savedListing", {
                    userId,
                    listingId: listing._id,
                    listingKey,
                    listingName: listing.apartmentName,
                    listingLocation: listing.location,
                    listingRent: formatRent(listing.rentAmount)
                });
                setMessage("Listing saved.");
            }
            fetchSavedListings();
        } catch (err) {
            setMessage(err.response?.data?.errorMessage || "Saved listing could not be updated.");
        }
    }

    function matchesSearch(listing) {
        const text = searchText.trim().toLowerCase();
        const tagText = tagFilter.trim().toLowerCase();
        const maxRentNumber = Number(maxRent);
        const searchableText = [
            listing.apartmentName,
            listing.description,
            listing.location,
            listing.city,
            listing.state,
            ...(listing.lifestyleTags || []),
            ...(listing.idealRoommateTags || [])
        ].join(" ").toLowerCase();
        const listingTags = [...(listing.lifestyleTags || []), ...(listing.idealRoommateTags || [])]
            .join(" ")
            .toLowerCase();

        if (text && !searchableText.includes(text)) {
            return false;
        }
        if (tagText && !listingTags.includes(tagText)) {
            return false;
        }
        if (maxRent && (!listing.rentAmount || listing.rentAmount > maxRentNumber)) {
            return false;
        }
        return true;
    }

    const savedListingKeys = savedListings.map(savedListing => savedListing.listingKey);
    const visibleListings = listings.filter(matchesSearch);

    return (
        <section className="layoutSearch">
            <div className="sidebarSearch">
                <div className="search">
                    <h1>Apartment Search</h1>
                </div>
                <input
                    type="text"
                    placeholder="Search by name, city, or description"
                    className="search"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                />
                <div className="searchFilterRow">
                    <input
                        type="number"
                        placeholder="Max rent"
                        value={maxRent}
                        onChange={e => setMaxRent(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Lifestyle tag"
                        value={tagFilter}
                        onChange={e => setTagFilter(e.target.value)}
                    />
                </div>
                {message && <p className="searchMessage">{message}</p>}
                {loading && <p className="searchMessage">Loading listings...</p>}
                {!loading && visibleListings.length === 0 && <p className="searchMessage">No listings match your search.</p>}
                {visibleListings.map(listing => {
                    const listingKey = getListingKey(listing);
                    const matchDetails = currentUser
                        ? getListingMatchDetails(currentUser, listing, ownersById[String(listing.createdBy)])
                        : null;
                    return (
                        <article className="apartmentListWrapper" key={listing._id}>
                            <Link
                                className="apartmentListCardLink"
                                to={`/Apartment?id=${listing._id}`}
                                aria-label={`View details for ${listing.apartmentName || "listing"}`}
                            >
                                <div className="apartmentListImage">
                                    <img src={getListingImage(listing)} alt={listing.apartmentName || "Apartment"} />
                                </div>
                                <div className="apartmentList">
                                    <h1>{listing.apartmentName || "Untitled Listing"}</h1>
                                    <p>{listing.description || "No description provided."}</p>
                                    <p>{listing.location || [listing.city, listing.state].filter(Boolean).join(", ")}</p>
                                    <p>{formatRent(listing.rentAmount)}</p>
                                    {Array.isArray(listing.lifestyleTags) && listing.lifestyleTags.length > 0 && (
                                        <p>Tags: {listing.lifestyleTags.join(", ")}</p>
                                    )}
                                    {matchDetails?.isMatch && (
                                        <div className="profileMatchCard">
                                            <strong>Profile match</strong>
                                            <span>{matchDetails.reasons.slice(0, 3).join(" • ") || "Compatible with your profile preferences."}</span>
                                        </div>
                                    )}
                                    {matchDetails && !matchDetails.profileComplete && (
                                        <div className="profileMatchCard profileMatchPrompt">
                                            <strong>Want better roommate matches?</strong>
                                            <span>Add budget, location, and lifestyle tags in Settings.</span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <div className="apartmentListActions">
                                <Link to={`/Apartment?id=${listing._id}`}>View Details</Link>
                                <button type="button" onClick={() => toggleSavedListing(listing)}>
                                    {savedListingKeys.includes(listingKey) ? "Unsave" : "Save"}
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
            <div className="bodySearch">
                <div className="filters">
                    <h2>Saved Listings</h2>
                    {savedListings.length === 0 ? (
                        <p>No saved listings yet.</p>
                    ) : (
                        savedListings.map(savedListing => (
                            <div key={savedListing._id} className="savedListingCard">
                                <h3>{savedListing.listingName}</h3>
                                <p>{savedListing.listingLocation}</p>
                                <p>{savedListing.listingRent}</p>
                                {savedListing.listingId && <Link to={`/Apartment?id=${savedListing.listingId}`}>Open</Link>}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}

export default Search;
