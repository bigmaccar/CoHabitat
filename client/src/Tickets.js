import { Link } from "react-router-dom";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

const SUPPORT_EMAIL = "support@gmail.com";

function getSavedData(key, fallbackValue) {
    const savedValue = localStorage.getItem(key);
    if (!savedValue) {
        return fallbackValue;
    }

    try {
        return JSON.parse(savedValue);
    } catch (err) {
        return fallbackValue;
    }
}

function getSavedChatMap(key) {
    const savedValue = getSavedData(key, {});
    return Array.isArray(savedValue) ? {} : savedValue;
}

function getLastMessageId(messages) {
    return messages[messages.length - 1]?._id || "";
}

function getSupportThreadKey(message) {
    const participantId = message.senderName === "Support Team" ? message.receiverId : message.senderId;
    return `${participantId}:${message.supportChatId || "legacy"}`;
}

function isSupportEndMessage(message) {
    return Boolean(message?.isSupportChatEnded) ||
        (message?.isSupportMessage && message.senderName === "Support Team" && message.messageText === "Support chat ended.");
}

function isSupportThreadClosed(messages) {
    let lastEndIndex = -1;
    messages.forEach((message, index) => {
        if (isSupportEndMessage(message)) {
            lastEndIndex = index;
        }
    });

    if (lastEndIndex === -1) {
        return false;
    }

    return !messages.slice(lastEndIndex + 1).some(message => message.startsSupportChat);
}

function Tickets(){
    const supportUserId = localStorage.getItem("userId");
    const supportUserEmail = localStorage.getItem("userEmail") || "";
    const isSupportUser = supportUserEmail.toLowerCase() === SUPPORT_EMAIL;
    const hiddenChatsKey = `hiddenSupportChats_${supportUserId}`;
    const chatNamesKey = `supportChatNames_${supportUserId}`;
    const [activeTab, setActiveTab] = useState("messages");
    const [supportMessages, setSupportMessages] = useState([]);
    const [supportTickets, setSupportTickets] = useState([]);
    const [listings, setListings] = useState([]);
    const [activeSenderId, setActiveSenderId] = useState("");
    const [activeTicketId, setActiveTicketId] = useState("");
    const [replyText, setReplyText] = useState("");
    const [ticketReplyText, setTicketReplyText] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [ticketFilters, setTicketFilters] = useState({
        type: "",
        status: "",
        priority: "",
        apartmentId: ""
    });
    const [hiddenChats, setHiddenChats] = useState(() => getSavedChatMap(hiddenChatsKey));
    const [chatNames, setChatNames] = useState(() => getSavedData(chatNamesKey, {}));

    const fetchSupportMessages = useCallback(async () => {
        if (!isSupportUser) {
            return;
        }

        try {
            const res = await axios.get("http://localhost:7000/api/messages", {
                params: { isSupportMessage: true }
            });
            const sortedMessages = res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setSupportMessages(sortedMessages);
            if (!activeSenderId && sortedMessages.length > 0) {
                setActiveSenderId(getSupportThreadKey(sortedMessages[0]));
            }
        } catch (err) {
            setStatusMessage(err.response?.data?.errorMessage || "Support messages could not be loaded.");
        }
    }, [activeSenderId, isSupportUser]);

    useEffect(() => {
        fetchSupportMessages();
    }, [fetchSupportMessages]);

    const fetchSupportTickets = useCallback(async () => {
        if (!isSupportUser) {
            return;
        }

        try {
            const res = await axios.get("http://localhost:7000/api/supportTickets", {
                params: ticketFilters
            });
            const tickets = Array.isArray(res.data) ? res.data : [];
            setSupportTickets(tickets);
            if (!activeTicketId && tickets.length > 0) {
                setActiveTicketId(tickets[0]._id);
            }
        } catch (err) {
            setStatusMessage(err.response?.data?.errorMessage || "Support tickets could not be loaded.");
        }
    }, [activeTicketId, isSupportUser, ticketFilters]);

    useEffect(() => {
        if (activeTab === "tickets") {
            fetchSupportTickets();
        }
    }, [activeTab, fetchSupportTickets]);

    useEffect(() => {
        async function fetchListings() {
            if (!isSupportUser) {
                return;
            }

            try {
                const res = await axios.get("http://localhost:7000/api/listings");
                setListings(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                setListings([]);
            }
        }

        if (activeTab === "tickets") {
            fetchListings();
        }
    }, [activeTab, isSupportUser]);

    const supportThreads = supportMessages.reduce((threadList, message) => {
        const senderKey = getSupportThreadKey(message);
        if (!threadList[senderKey]) {
            threadList[senderKey] = [];
        }
        threadList[senderKey].push(message);
        return threadList;
    }, {});

    const supportThreadEntries = Object.entries(supportThreads);
    const visibleSupportThreadEntries = supportThreadEntries.filter(([senderId, threadMessages]) => !isThreadHidden(senderId, threadMessages));
    const activeThreadMessages = supportThreads[activeSenderId] || [];
    const activeMessages = isThreadHidden(activeSenderId, activeThreadMessages) ? [] : activeThreadMessages;
    const activeSupportUserId = activeMessages.find(message => message.senderName !== "Support Team")?.senderId ||
        activeMessages.find(message => message.senderName === "Support Team")?.receiverId;
    const supportUserName = activeMessages.find(message => message.senderName !== "Support Team")?.senderName || "User";
    const activeThreadName = activeMessages.length > 0 ? getSupportThreadName(activeSenderId, activeMessages) : "User";
    const supportThreadClosed = isSupportThreadClosed(activeMessages);
    const activeTicket = supportTickets.find(ticket => ticket._id === activeTicketId);

    function getListingName(apartmentId) {
        const listing = listings.find(item => String(item._id) === String(apartmentId));
        return listing?.apartmentName || "No apartment selected";
    }

    function isThreadHidden(senderId, threadMessages) {
        return hiddenChats[senderId] === getLastMessageId(threadMessages);
    }

    function saveHiddenChats(newHiddenChats) {
        setHiddenChats(newHiddenChats);
        localStorage.setItem(hiddenChatsKey, JSON.stringify(newHiddenChats));
    }

    function saveChatNames(newChatNames) {
        setChatNames(newChatNames);
        localStorage.setItem(chatNamesKey, JSON.stringify(newChatNames));
    }

    function getSupportThreadName(senderId, threadMessages) {
        if (chatNames[senderId]) {
            return chatNames[senderId];
        }

        const firstUserMessage = threadMessages.find(message => message.senderName !== "Support Team");
        const userName = firstUserMessage?.senderName || "User";
        const firstText = firstUserMessage?.messageText || "";
        return firstText ? `${userName}: ${firstText.slice(0, 16)}` : userName;
    }

    function renameChat(senderId, threadMessages) {
        const currentName = getSupportThreadName(senderId, threadMessages);
        const newName = window.prompt("Enter a new chat name:", currentName);
        if (newName === null) {
            return;
        }

        const trimmedName = newName.trim();
        const newChatNames = { ...chatNames };
        if (trimmedName) {
            newChatNames[senderId] = trimmedName;
        } else {
            delete newChatNames[senderId];
        }
        saveChatNames(newChatNames);
    }

    function hideChat(senderId, threadMessages) {
        const lastMessageId = getLastMessageId(threadMessages);
        if (!lastMessageId) {
            return;
        }

        const newHiddenChats = { ...hiddenChats, [senderId]: lastMessageId };
        saveHiddenChats(newHiddenChats);

        if (activeSenderId === senderId) {
            const nextVisibleThread = supportThreadEntries.find(([otherSenderId, otherThreadMessages]) => {
                return otherSenderId !== senderId && newHiddenChats[otherSenderId] !== getLastMessageId(otherThreadMessages);
            });
            setActiveSenderId(nextVisibleThread ? nextVisibleThread[0] : "");
        }
    }

    async function sendSupportReply(e) {
        e.preventDefault();
        if (!replyText || !activeSupportUserId || !isSupportUser) {
            return;
        }

        try {
            await axios.post("http://localhost:7000/api/message", {
                senderId: supportUserId,
                senderName: "Support Team",
                receiverId: activeSupportUserId,
                receiverName: supportUserName,
                listingName: "Support",
                messageText: replyText,
                isSupportMessage: true,
                supportChatId: activeMessages[0]?.supportChatId
            });
            setReplyText("");
            setStatusMessage("Support reply sent.");
            fetchSupportMessages();
        } catch (err) {
            setStatusMessage(err.response?.data?.errorMessage || "Support reply could not be sent.");
        }
    }

    async function endSupportChat() {
        if (!activeSupportUserId || !isSupportUser) {
            return;
        }

        try {
            await axios.post("http://localhost:7000/api/message", {
                senderId: supportUserId,
                senderName: "Support Team",
                receiverId: activeSupportUserId,
                receiverName: supportUserName,
                listingName: "Support",
                messageText: "Support chat ended.",
                isSupportMessage: true,
                supportChatId: activeMessages[0]?.supportChatId,
                isSupportChatEnded: true
            });
            setStatusMessage("Support chat ended.");
            fetchSupportMessages();
        } catch (err) {
            setStatusMessage(err.response?.data?.errorMessage || "Support chat could not be ended.");
        }
    }

    async function updateTicketStatus(ticketId, status) {
        try {
            const res = await axios.put("http://localhost:7000/api/update/supportTicket/" + ticketId, {
                status
            });
            setSupportTickets(currentTickets => currentTickets.map(ticket => {
                return ticket._id === ticketId ? res.data : ticket;
            }));
            setStatusMessage("Ticket status updated.");
        } catch (err) {
            setStatusMessage(err.response?.data?.errorMessage || "Ticket status could not be updated.");
        }
    }

    async function sendTicketReply(e) {
        e.preventDefault();
        if (!activeTicket || !ticketReplyText.trim()) {
            return;
        }

        try {
            const res = await axios.post("http://localhost:7000/api/supportTicket/" + activeTicket._id + "/messages", {
                supportTicketId: activeTicket._id,
                authorId: supportUserId,
                text: ticketReplyText.trim()
            });
            setSupportTickets(currentTickets => currentTickets.map(ticket => {
                return ticket._id === activeTicket._id ? res.data : ticket;
            }));
            setTicketReplyText("");
            setStatusMessage("Ticket reply sent.");
        } catch (err) {
            setStatusMessage(err.response?.data?.errorMessage || "Ticket reply could not be sent.");
        }
    }

    if (!isSupportUser) {
        return (
            <section className="layout">
                <div className="leftSide">
                    <div className="sidebar">
                        <center><ul>
                            <li className="active"><Link to="/Tickets"><figure><img src={require("./images/list.png")} className="icon" alt="Tickets"/><figcaption>Tickets</figcaption></figure></Link></li>
                            <li><Link to="/AllHouseholds"><figure><img src={require("./images/homeIcon.png")} className="icon" alt="Households"/><figcaption>Households</figcaption></figure></Link></li>
                            <li><Link to="/AllUsers"><figure><img src={require("./images/roommates.png")} className="icon" alt="Users"/><figcaption>Users</figcaption></figure></Link></li>
                        </ul></center>
                    </div>
                </div>
                <div className="body messagePage">
                    <h1>Support Messages</h1>
                    <div className="messagePanel supportComposer">
                        <h2>Support Login Required</h2>
                        <p>Log in as {SUPPORT_EMAIL} to view and reply to support messages.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="layout">
            <div className="leftSide">
                <div className="sidebar">
                    <center><ul>
                        <li className="active"><Link to="/Tickets"><figure><img src={require("./images/list.png")} className="icon" alt="Tickets"/><figcaption>Tickets</figcaption></figure></Link></li>
                        <li><Link to="/AllHouseholds"><figure><img src={require("./images/homeIcon.png")} className="icon" alt="Households"/><figcaption>Households</figcaption></figure></Link></li>
                        <li><Link to="/AllUsers"><figure><img src={require("./images/roommates.png")} className="icon" alt="Users"/><figcaption>Users</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body messagePage">
                <h1>Support</h1>
                <div style={{ marginBottom: "15px" }}>
                    <button
                        className={activeTab === "messages" ? "btnGreen" : "btnOutline"}
                        type="button"
                        onClick={() => setActiveTab("messages")}
                    >
                        Support Messages
                    </button>
                    <button
                        className={activeTab === "tickets" ? "btnGreen" : "btnOutline"}
                        type="button"
                        onClick={() => setActiveTab("tickets")}
                    >
                        Support Tickets
                    </button>
                </div>
                {statusMessage && <p>{statusMessage}</p>}

                {activeTab === "messages" && <div className="chatLayout">
                    <div className="threadList">
                        <h2>Users</h2>
                        {supportThreadEntries.length === 0 ? (
                            <p>No support messages yet.</p>
                        ) : visibleSupportThreadEntries.length === 0 ? (
                            <p>No visible support messages.</p>
                        ) : (
                            visibleSupportThreadEntries.map(([senderId, threadMessages]) => (
                                <div className="threadItem" key={senderId}>
                                    <button
                                        className={activeSenderId === senderId ? "threadButton activeThread" : "threadButton"}
                                        onClick={() => setActiveSenderId(senderId)}
                                    >
                                        {getSupportThreadName(senderId, threadMessages)}
                                        {isSupportThreadClosed(threadMessages) ? " (Ended)" : ""}
                                    </button>
                                    <button className="smallChatButton" type="button" onClick={() => renameChat(senderId, threadMessages)}>Rename</button>
                                    <button className="smallChatButton deleteChatButton" type="button" onClick={() => hideChat(senderId, threadMessages)}>Delete</button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="chatWindow">
                        <h2>{activeThreadName}</h2>
                        {activeMessages.length === 0 ? (
                            <p>Select a support conversation.</p>
                        ) : (
                            activeMessages.map(message => (
                                <div
                                    className={isSupportEndMessage(message) ? "chatBubble systemBubble" : message.senderName === "Support Team" ? "chatBubble outgoingBubble" : "chatBubble incomingBubble"}
                                    key={message._id}
                                >
                                    <p>{message.messageText}</p>
                                    {!isSupportEndMessage(message) && <small>{message.senderName === "Support Team" ? "Support Team" : message.senderName || "User"}</small>}
                                </div>
                            ))
                        )}
                        {supportThreadClosed && <p className="closedChatNotice">This support chat has been ended.</p>}
                        {activeSenderId && !supportThreadClosed && (
                            <form className="chatReplyForm" onSubmit={sendSupportReply}>
                                <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="Write a support reply."
                                    required
                                />
                                <button type="submit">Reply as Support</button>
                            </form>
                        )}
                        {activeSenderId && !supportThreadClosed && (
                            <button className="endChatButton" type="button" onClick={endSupportChat}>
                                End Support Chat
                            </button>
                        )}
                    </div>
                </div>}

                {activeTab === "tickets" && (
                    <div className="chatLayout">
                        <div className="threadList">
                            <h2>Tickets</h2>
                            <select
                                value={ticketFilters.type}
                                onChange={e => setTicketFilters({ ...ticketFilters, type: e.target.value })}
                            >
                                <option value="">All Types</option>
                                <option value="apartment">Apartment</option>
                                <option value="billing">Billing</option>
                                <option value="safety">Safety</option>
                                <option value="bug">Bug</option>
                                <option value="other">Other</option>
                            </select>
                            <select
                                value={ticketFilters.status}
                                onChange={e => setTicketFilters({ ...ticketFilters, status: e.target.value })}
                            >
                                <option value="">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                            <select
                                value={ticketFilters.priority}
                                onChange={e => setTicketFilters({ ...ticketFilters, priority: e.target.value })}
                            >
                                <option value="">All Priorities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                            <select
                                value={ticketFilters.apartmentId}
                                onChange={e => setTicketFilters({ ...ticketFilters, apartmentId: e.target.value })}
                            >
                                <option value="">All Apartments</option>
                                {listings.map(listing => (
                                    <option key={listing._id} value={listing._id}>{listing.apartmentName}</option>
                                ))}
                            </select>

                            {supportTickets.length === 0 ? (
                                <p>No support tickets yet.</p>
                            ) : (
                                supportTickets.map(ticket => (
                                    <button
                                        className={activeTicketId === ticket._id ? "threadButton activeThread" : "threadButton"}
                                        key={ticket._id}
                                        type="button"
                                        onClick={() => setActiveTicketId(ticket._id)}
                                    >
                                        {ticket.title}
                                        <br />
                                        <small>{ticket.type} / {ticket.status}</small>
                                        <br />
                                        <small>{getListingName(ticket.apartmentId)}</small>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="chatWindow">
                            {!activeTicket ? (
                                <p>Select a support ticket.</p>
                            ) : (
                                <>
                                    <h2>{activeTicket.title}</h2>
                                    <p><strong>Type:</strong> {activeTicket.type}</p>
                                    <p><strong>Apartment:</strong> {getListingName(activeTicket.apartmentId)}</p>
                                    <p><strong>Priority:</strong> {activeTicket.priority}</p>
                                    <p><strong>Description:</strong> {activeTicket.description}</p>
                                    <label htmlFor="ticketStatus"><strong>Status:</strong></label>
                                    <select
                                        id="ticketStatus"
                                        value={activeTicket.status}
                                        onChange={e => updateTicketStatus(activeTicket._id, e.target.value)}
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>

                                    <h3>Ticket Messages</h3>
                                    {(!activeTicket.messages || activeTicket.messages.length === 0) ? (
                                        <p>No ticket messages yet.</p>
                                    ) : (
                                        activeTicket.messages.map(message => (
                                            <div
                                                className={String(message.authorId) === String(supportUserId) ? "chatBubble outgoingBubble" : "chatBubble incomingBubble"}
                                                key={message._id || message.createdAt}
                                            >
                                                <p>{message.text}</p>
                                                <small>{String(message.authorId) === String(supportUserId) ? "Support Team" : "User"}</small>
                                            </div>
                                        ))
                                    )}

                                    <form className="chatReplyForm" onSubmit={sendTicketReply}>
                                        <textarea
                                            value={ticketReplyText}
                                            onChange={e => setTicketReplyText(e.target.value)}
                                            placeholder="Write a ticket reply."
                                            required
                                        />
                                        <button type="submit">Send Ticket Reply</button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Tickets;
