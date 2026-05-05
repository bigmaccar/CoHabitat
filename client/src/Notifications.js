import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getListingMatchDetails } from "./matching";

function getNotificationLastSeenKey(userId) {
    return `notificationsLastSeen_${userId}`;
}

function getTimestamp(value) {
    return value ? new Date(value).getTime() : 0;
}

function formatTime(value) {
    if (!value) {
        return "";
    }
    return new Date(value).toLocaleString();
}

function Notifications({ onNotificationsSeen }) {
    const userId = localStorage.getItem("userId");
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [applications, setApplications] = useState([]);
    const [matches, setMatches] = useState([]);
    const [lastSeen, setLastSeen] = useState(0);
    const [message, setMessage] = useState("Loading notifications...");

    useEffect(() => {
        async function fetchNotifications() {
            if (!userId) {
                setMessage("Log in to view notifications.");
                return;
            }

            const previousLastSeen = Number(localStorage.getItem(getNotificationLastSeenKey(userId)) || 0);
            setLastSeen(previousLastSeen);

            try {
                const [userRes, listingsRes, messagesRes, ownListingsRes] = await Promise.all([
                    axios.get("http://localhost:7000/api/user", { params: { id: userId } }),
                    axios.get("http://localhost:7000/api/listings", { params: { isActive: true } }),
                    axios.get("http://localhost:7000/api/messages", { params: { receiverId: userId } }),
                    axios.get("http://localhost:7000/api/listings", { params: { createdBy: userId } })
                ]);
                const user = userRes.data;
                const listings = Array.isArray(listingsRes.data) ? listingsRes.data : [];
                const ownListings = Array.isArray(ownListingsRes.data) ? ownListingsRes.data : [];
                const usersRes = await axios.get("http://localhost:7000/api/users");
                const users = Array.isArray(usersRes.data) ? usersRes.data : [];
                const usersById = users.reduce((owners, owner) => {
                    owners[String(owner._id)] = owner;
                    return owners;
                }, {});
                const matchingListings = listings
                    .map(listing => ({
                        ...listing,
                        matchDetails: getListingMatchDetails(user, listing, usersById[String(listing.createdBy)])
                    }))
                    .filter(listing => listing.matchDetails.isMatch)
                    .sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt));
                const applicationNotifications = ownListings.flatMap(listing => {
                    return (listing.applicants || []).map(applicant => ({
                        ...applicant,
                        listingId: listing._id,
                        listingName: listing.apartmentName || "Your listing"
                    }));
                }).sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt));
                const inboxMessages = (Array.isArray(messagesRes.data) ? messagesRes.data : [])
                    .sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt));

                setReceivedMessages(inboxMessages);
                setApplications(applicationNotifications);
                setMatches(matchingListings);
                setMessage("");
                localStorage.setItem(getNotificationLastSeenKey(userId), String(Date.now()));
                if (onNotificationsSeen) {
                    onNotificationsSeen();
                }
            } catch (err) {
                setMessage(err.response?.data?.message || "Notifications could not be loaded.");
            }
        }

        fetchNotifications();
    }, [onNotificationsSeen, userId]);

    const hasNotifications = receivedMessages.length > 0 || applications.length > 0 || matches.length > 0;

    return (
        <section className="notificationPage">
            <h1>Notifications</h1>
            {message && <p>{message}</p>}
            {!message && !hasNotifications && <p>No notifications yet.</p>}

            <section className="notificationSection">
                <h2>Messages</h2>
                {receivedMessages.length === 0 ? (
                    <p>No received messages yet.</p>
                ) : (
                    receivedMessages.map(item => {
                        const unread = getTimestamp(item.createdAt) > lastSeen;
                        const messageLink = item.isSupportMessage ? "/Messages" : `/Messages?recipientId=${item.senderId || ""}`;
                        return (
                            <div className={unread ? "notificationCard unreadNotification" : "notificationCard"} key={item._id}>
                                <span className="notificationIcon">MSG</span>
                                <div>
                                    <h3>{unread && <span className="unreadDot">New</span>} Message from {item.senderName || "User"}</h3>
                                    <p>{item.messageText}</p>
                                    <small>{formatTime(item.createdAt)}</small>
                                    <br />
                                    <Link to={messageLink}>Open conversation</Link>
                                </div>
                            </div>
                        );
                    })
                )}
            </section>

            <section className="notificationSection">
                <h2>Applications</h2>
                {applications.length === 0 ? (
                    <p>No applications on your listings yet.</p>
                ) : (
                    applications.map(item => {
                        const unread = getTimestamp(item.createdAt) > lastSeen;
                        return (
                            <div className={unread ? "notificationCard unreadNotification" : "notificationCard"} key={item._id || `${item.listingId}-${item.userId}`}>
                                <span className="notificationIcon">APP</span>
                                <div>
                                    <h3>{unread && <span className="unreadDot">New</span>} Application for {item.listingName}</h3>
                                    <p>{item.name || item.email || "Someone"} applied. Status: {item.status || "pending"}.</p>
                                    {item.message && <p>{item.message}</p>}
                                    <small>{formatTime(item.createdAt)}</small>
                                    <br />
                                    <Link to="/ApartmentListing">Review applicants</Link>
                                </div>
                            </div>
                        );
                    })
                )}
            </section>

            <section className="notificationSection">
                <h2>Suggested Listings</h2>
                {matches.length === 0 ? (
                    <p>No matching listings right now.</p>
                ) : (
                    matches.map(listing => {
                        const unread = getTimestamp(listing.createdAt) > lastSeen;
                        return (
                        <div className={unread ? "notificationCard unreadNotification" : "notificationCard"} key={listing._id}>
                            <span className="notificationIcon">APT</span>
                            <div>
                                <h3>{unread && <span className="unreadDot">New</span>} {listing.apartmentName}</h3>
                                <p>{listing.location || [listing.city, listing.state].filter(Boolean).join(", ")}</p>
                                <p>${listing.rentAmount}/month</p>
                                <p>{listing.matchDetails.reasons.join(" • ") || "Compatible with your profile preferences."}</p>
                                <small>{formatTime(listing.createdAt)}</small>
                                <br />
                                <Link to={`/Apartment?id=${listing._id}`}>View Listing</Link>
                            </div>
                        </div>
                        );
                    })
                )}
            </section>
        </section>
    );
}

export default Notifications;
