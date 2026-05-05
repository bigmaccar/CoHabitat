import { Link, useSearchParams } from "react-router-dom";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

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

function userLabel(user) {
    if (!user) {
        return "Lister";
    }
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Lister";
}

function Apartment(){
    const [searchParams] = useSearchParams();
    const listingId = searchParams.get("id");
    const [listing, setListing] = useState(null);
    const [savedListings, setSavedListings] = useState([]);
    const [owner, setOwner] = useState(null);
    const [showMessageForm, setShowMessageForm] = useState(false);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [applicationMessage, setApplicationMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const userId = localStorage.getItem("userId");
    const senderName = localStorage.getItem("userName") || "User";
    const userEmail = localStorage.getItem("userEmail") || "";

    const fetchListing = useCallback(async () => {
        if (!listingId) {
            setError("Select a listing from the search page.");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get("http://localhost:7000/api/listing", {
                params: { id: listingId }
            });
            setListing(res.data);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errorMessage || "Listing could not be loaded.");
        } finally {
            setLoading(false);
        }
    }, [listingId]);

    const fetchSavedListings = useCallback(async () => {
        if (!userId) {
            return;
        }

        try {
            const res = await axios.get("http://localhost:7000/api/savedListings", {
                params: { userId }
            });
            setSavedListings(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setError(err.response?.data?.errorMessage || "Saved listings could not be loaded.");
        }
    }, [userId]);

    const fetchOwner = useCallback(async (ownerId) => {
        if (!ownerId) {
            setOwner(null);
            return;
        }

        try {
            const res = await axios.get("http://localhost:7000/api/user", {
                params: { id: ownerId }
            });
            setOwner(res.data);
        } catch (err) {
            setOwner(null);
        }
    }, []);

    const fetchMessages = useCallback(async (listingName) => {
        if (!userId || !listingName) {
            return;
        }

        try {
            const res = await axios.get("http://localhost:7000/api/messages", {
                params: {
                    senderId: userId,
                    listingName
                }
            });
            setMessages(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setError(err.response?.data?.errorMessage || "Messages could not be loaded.");
        }
    }, [userId]);

    useEffect(() => {
        fetchListing();
        fetchSavedListings();
    }, [fetchListing, fetchSavedListings]);

    useEffect(() => {
        if (listing) {
            fetchOwner(listing.createdBy);
            fetchMessages(listing.apartmentName);
        }
    }, [fetchMessages, fetchOwner, listing]);

    async function toggleSavedListing() {
        const listingKey = getListingKey(listing);
        if (!userId) {
            setError("You must be logged in to save listings.");
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
                setNotice("Listing removed from saved listings.");
            } else {
                await axios.post("http://localhost:7000/api/savedListing", {
                    userId,
                    listingId: listing._id,
                    listingKey,
                    listingName: listing.apartmentName,
                    listingLocation: listing.location,
                    listingRent: formatRent(listing.rentAmount)
                });
                setNotice("Listing saved.");
            }
            fetchSavedListings();
            setError("");
        } catch (err) {
            setError(err.response?.data?.errorMessage || "Saved listing could not be updated.");
        }
    }

    async function handleMessageSubmit(e) {
        e.preventDefault();
        if (!listing.createdBy) {
            setError("This listing does not have a lister to message.");
            return;
        }

        try {
            await axios.post("http://localhost:7000/api/message", {
                senderId: userId,
                senderName,
                receiverId: listing.createdBy,
                receiverName: userLabel(owner),
                listingName: listing.apartmentName,
                messageText
            });
            setNotice("Message sent to the lister.");
            setMessageText("");
            setShowMessageForm(false);
            fetchMessages(listing.apartmentName);
            setError("");
        } catch (err) {
            setError(err.response?.data?.errorMessage || "Message could not be sent.");
        }
    }

    async function handleApplicationSubmit(e) {
        e.preventDefault();
        if (!listing || !userId) {
            setError("You must be logged in to apply.");
            return;
        }
        if (isOwnListing) {
            setError("You cannot apply to your own listing.");
            return;
        }
        if (isBlacklisted) {
            setError("You cannot apply to this listing.");
            return;
        }
        if (existingApplication) {
            setNotice("You already applied to this listing.");
            setShowApplyForm(false);
            return;
        }

        const applicants = [
            ...(listing.applicants || []),
            {
                userId,
                name: senderName,
                email: userEmail,
                message: applicationMessage,
                status: "pending"
            }
        ];

        try {
            const res = await axios.put("http://localhost:7000/api/update/listing/" + listing._id, {
                applicants
            });
            setListing(res.data);
            setApplicationMessage("");
            setShowApplyForm(false);
            setNotice("Application submitted.");
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errorMessage || "Application could not be submitted.");
        }
    }

    if (loading) {
        return <p className="searchMessage">Loading listing...</p>;
    }

    if (error && !listing) {
        return (
            <section className="layoutApartment">
                <div className="apartmentPage">
                    <Link to="/Search">Back to Search</Link>
                    <p className="messageErrorNotice">{error}</p>
                </div>
            </section>
        );
    }

    const listingKey = getListingKey(listing);
    const isSaved = savedListings.some(savedListing => savedListing.listingKey === listingKey);
    const isFilled = listing.isActive === false;
    const isOwnListing = String(listing.createdBy || "") === String(userId || "");
    const isBlacklisted = (listing.blacklistedUserIds || []).map(String).includes(String(userId || ""));
    const existingApplication = (listing.applicants || []).find(applicant => String(applicant.userId || "") === String(userId || ""));
    const canApply = !isFilled && !isOwnListing && !isBlacklisted && !existingApplication;

    return (
        <section className="layoutApartment">
            <div className="sidebarApartment">
                <div className="apartmentPage">
                    <Link to="/Search">Back to Search</Link>
                    <h1>{listing.apartmentName || "Apartment"}</h1>
                    <img src={getListingImage(listing)} className="apartmentPageImage" alt={listing.apartmentName || "Apartment"} />
                    <div className="containerApartment">
                        <button type="button" onClick={toggleSavedListing}>{isSaved ? "Unsave" : "Save"}</button>
                        <button type="button" disabled={isFilled || isOwnListing} onClick={() => setShowMessageForm(!showMessageForm)}>Message</button>
                        <button type="button" disabled={!canApply} onClick={() => setShowApplyForm(!showApplyForm)}>Apply</button>
                    </div>
                    {notice && <p className="messageSentNotice">{notice}</p>}
                    {error && <p className="messageErrorNotice">{error}</p>}
                    {isFilled && <p className="closedListingNotice">This listing is filled and no longer accepting inquiries.</p>}
                    {isOwnListing && <p className="closedListingNotice">This is your listing.</p>}
                    {isBlacklisted && <p className="closedListingNotice">You cannot apply to this listing.</p>}
                    {existingApplication && <p className="closedListingNotice">Application status: {existingApplication.status || "pending"}</p>}
                    {showMessageForm && !isFilled && !isOwnListing && (
                        <form className="messageListerForm" onSubmit={handleMessageSubmit}>
                            <label htmlFor="messageText">Message {userLabel(owner)}</label>
                            <textarea
                                id="messageText"
                                value={messageText}
                                onChange={e => setMessageText(e.target.value)}
                                placeholder="Write your message here."
                                required
                            />
                            <button type="submit">Send Message</button>
                        </form>
                    )}
                    {showApplyForm && canApply && (
                        <form className="messageListerForm" onSubmit={handleApplicationSubmit}>
                            <label htmlFor="applicationMessage">Application Message</label>
                            <textarea
                                id="applicationMessage"
                                value={applicationMessage}
                                onChange={e => setApplicationMessage(e.target.value)}
                                placeholder="Write a short note to the lister."
                                required
                            />
                            <button type="submit">Submit Application</button>
                        </form>
                    )}
                </div>
            </div>
            <div className="bodyApartment">
               <div className="apartmentPage2">
                    <h1>Information</h1>
                    <p>{listing.description || "No description provided."}</p>
                    <p><strong>Location:</strong> {listing.location || [listing.city, listing.state].filter(Boolean).join(", ")}</p>
                    {listing.address && <p><strong>Address:</strong> {listing.address} {listing.zipCode}</p>}
                    <p><strong>Rent:</strong> {formatRent(listing.rentAmount)}</p>
                    {listing.houseRules && <p><strong>House Rules:</strong> {listing.houseRules}</p>}
                    {Array.isArray(listing.lifestyleTags) && listing.lifestyleTags.length > 0 && (
                        <p><strong>Apartment Lifestyle:</strong> {listing.lifestyleTags.join(", ")}</p>
                    )}
                    {Array.isArray(listing.idealRoommateTags) && listing.idealRoommateTags.length > 0 && (
                        <p><strong>Ideal Roommate:</strong> {listing.idealRoommateTags.join(", ")}</p>
                    )}
                    <h2>Lister</h2>
                    <div className="tenantCard">
                        <h3>{userLabel(owner)}</h3>
                        {owner?.bio && <p>{owner.bio}</p>}
                        {Array.isArray(owner?.lifestyleTags) && owner.lifestyleTags.length > 0 && (
                            <p><strong>Lifestyle:</strong> {owner.lifestyleTags.join(", ")}</p>
                        )}
                        <Link to={`/TenantProfile?userId=${listing.createdBy || ""}&listingId=${listing._id}`}>View Tenant Profile</Link>
                    </div>
                    <h2>Messages Sent to Lister</h2>
                    <div className="sentMessages">
                        {messages.length === 0 ? (
                            <p>No messages sent yet.</p>
                        ) : (
                            messages.map(message => (
                                <div className="sentMessage" key={message._id}>
                                    <p>{message.messageText}</p>
                                    <small>To: {message.receiverName || "Lister"}</small>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Apartment;
