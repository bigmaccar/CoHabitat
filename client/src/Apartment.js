import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

const LISTING_NAME = "Apartment 1";
const LISTER_NAME = "Apartment 1 Lister";
const LISTING_KEY = "apartment-1";

function Apartment(){
    const [isFilled, setIsFilled] = useState(false);
    const [showMessageForm, setShowMessageForm] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [messageSent, setMessageSent] = useState(false);
    const [messages, setMessages] = useState([]);
    const [messageError, setMessageError] = useState("");

    useEffect(() => {
        fetchListingStatus();
        fetchMessages();
    }, []);

    async function fetchListingStatus() {
        try {
            const res = await axios.get("http://localhost:7000/api/listings", {
                params: { listingKey: LISTING_KEY }
            });
            if (res.data.length > 0) {
                setIsFilled(res.data[0].isActive === false);
            }
        } catch (err) {
            setMessageError(err.response?.data?.errorMessage || "Listing status could not be loaded.");
        }
    }

    async function fetchMessages() {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            return;
        }

        try {
            const res = await axios.get("http://localhost:7000/api/messages", {
                params: {
                    senderId: userId,
                    listingName: LISTING_NAME
                }
            });
            setMessages(res.data);
            setMessageError("");
        } catch (err) {
            setMessageError(err.response?.data?.errorMessage || "Messages could not be loaded.");
        }
    }

    async function handleMessageSubmit(e) {
        e.preventDefault();
        const userId = localStorage.getItem("userId");

        try {
            await axios.post("http://localhost:7000/api/message", {
                senderId: userId,
                receiverName: LISTER_NAME,
                listingName: LISTING_NAME,
                messageText
            });
            setMessageSent(true);
            setMessageText("");
            setShowMessageForm(false);
            fetchMessages();
        } catch (err) {
            setMessageSent(false);
            setMessageError(err.response?.data?.errorMessage || "Message could not be sent.");
        }
    }

    return (
        <>
        <section className="layoutApartment">
            <div className="sidebarApartment">
                <div className="apartmentPage">
                    <Link to="/Search">Back to Search</Link>
                    <h1>Apartment 1</h1>
                <img src={require("./images/apartment1.jpg")} className="apartmentPageImage" alt="Apartment 1"/>
                <div className="containerApartment">
                    <div></div>
                    <button>Save</button>
                    <button disabled={isFilled} onClick={() => setShowMessageForm(!showMessageForm)}>Message</button>
                    <button disabled={isFilled}>Apply</button>
                </div>
                {isFilled && <p className="closedListingNotice">This listing is filled and no longer accepting inquiries.</p>}
                {showMessageForm && !isFilled && (
                    <form className="messageListerForm" onSubmit={handleMessageSubmit}>
                        <label htmlFor="messageText">Message Lister</label>
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
                {messageSent && <p className="messageSentNotice">Message sent to the lister.</p>}
                {messageError && <p className="messageErrorNotice">{messageError}</p>}
                </div>
            </div>
            <div className="bodyApartment">
               <div className="apartmentPage2">
                    <h1>Information</h1>
                    <p>Two bedroom apartment near campus with shared kitchen, living room, and laundry access.</p>
                    <h2>Current Tenants</h2>
                    <div className="tenantCard">
                        <h3>Tenant 1</h3>
                        <p><strong>Role:</strong> Current tenant</p>
                        <p><strong>Lifestyle:</strong> Quiet, clean, studies at home during the week.</p>
                        <p><strong>Looking for:</strong> A roommate who respects shared spaces and communicates clearly.</p>
                        <Link to="/TenantProfile">View Tenant Profile</Link>
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
        </section></>
    )

}

export default Apartment;
