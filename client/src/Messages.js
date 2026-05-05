import { Link } from "react-router-dom";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

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

function getThreadKey(message, userId) {
    if (message.isSupportMessage) {
        return `support:${message.supportChatId || "legacy"}`;
    }

    const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
    return otherUserId || message.receiverName || message.senderName || "conversation";
}

function getThreadName(messages, userId) {
    const firstMessage = messages[0];
    if (firstMessage.isSupportMessage) {
        const firstText = firstMessage.messageText || "";
        return firstText ? `Support: ${firstText.slice(0, 20)}` : "Support";
    }
    if (firstMessage.senderId === userId) {
        return firstMessage.receiverName || "User";
    }
    return firstMessage.senderName || "User";
}

function isOutgoingMessage(message, userId) {
    if (message.isSupportMessage && message.senderName === "Support Team") {
        return false;
    }
    return message.senderId === userId;
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

function getReplyTarget(messages, userId) {
    const firstMessage = messages[0];
    if (!firstMessage) {
        return null;
    }

    if (firstMessage.isSupportMessage) {
        const supportReply = [...messages].reverse().find(message => message.senderName === "Support Team" && message.senderId);
        if (!supportReply) {
            return null;
        }

        return {
            id: supportReply.senderId,
            name: "Support Team"
        };
    }

    if (firstMessage.senderId === userId) {
        return {
            id: firstMessage.receiverId,
            name: firstMessage.receiverName || "User"
        };
    }

    return {
        id: firstMessage.senderId,
        name: firstMessage.senderName || "User"
    };
}

function Messages(){
    const userId = localStorage.getItem("userId");
    const householdId = localStorage.getItem("householdId");
    const userName = localStorage.getItem("userName") || "User";
    const hiddenChatsKey = `hiddenMessageChats_${userId}`;
    const chatNamesKey = `messageChatNames_${userId}`;
    
    // Existing message state
    const [messages, setMessages] = useState([]);
    const [activeThread, setActiveThread] = useState("");
    const [supportMessage, setSupportMessage] = useState("");
    const [replyText, setReplyText] = useState("");
    const [messageStatus, setMessageStatus] = useState("");
    const [hiddenChats, setHiddenChats] = useState(() => getSavedChatMap(hiddenChatsKey));
    const [chatNames, setChatNames] = useState(() => getSavedData(chatNamesKey, {}));

    // Support Tickets state
    const [activeTab, setActiveTab] = useState("messages"); // "messages" or "tickets"
    const [supportTickets, setSupportTickets] = useState([]);
    const [ticketListings, setTicketListings] = useState([]);
    const [activeTicketId, setActiveTicketId] = useState(null);
    const [ticketError, setTicketError] = useState("");
    const [showCreateTicketForm, setShowCreateTicketForm] = useState(false);
    const [newTicketForm, setNewTicketForm] = useState({
        title: "",
        description: "",
        type: "other",
        priority: "low",
        apartmentId: ""
    });
    const [ticketMessageText, setTicketMessageText] = useState("");
    const [ticketFilters, setTicketFilters] = useState({
        type: "",
        status: "",
        apartmentId: ""
    });

    // Fetch messages (existing)
    const fetchMessages = useCallback(async () => {
        try {
            const inboxRes = await axios.get("http://localhost:7000/api/messages", {
                params: { receiverId: userId }
            });
            const sentRes = await axios.get("http://localhost:7000/api/messages", {
                params: { senderId: userId }
            });
            const combinedMessages = [...inboxRes.data, ...sentRes.data]
                .filter((message, index, allMessages) => allMessages.findIndex(item => item._id === message._id) === index)
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            setMessages(combinedMessages);
            if (!activeThread && combinedMessages.length > 0) {
                setActiveThread(getThreadKey(combinedMessages[0], userId));
            }
        } catch (err) {
            setMessageStatus(err.response?.data?.errorMessage || "Messages could not be loaded.");
        }
    }, [activeThread, userId]);

    // Fetch support tickets
    const fetchSupportTickets = useCallback(async () => {
        if (!userId) return;
        try {
            const params = {
                reporterId: userId,
                ...ticketFilters
            };
            const res = await axios.get("http://localhost:7000/api/supportTickets", { params });
            const tickets = Array.isArray(res.data) ? res.data : [];
            setSupportTickets(tickets);
            if (!activeTicketId && tickets.length > 0) {
                setActiveTicketId(tickets[0]._id);
            }
            setTicketError("");
        } catch (err) {
            setTicketError(err.response?.data?.errorMessage || "Could not load support tickets");
        }
    }, [activeTicketId, ticketFilters, userId]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        if (activeTab === "tickets") {
            fetchSupportTickets();
        }
    }, [activeTab, fetchSupportTickets]);

    useEffect(() => {
        async function fetchTicketListings() {
            if (!householdId) {
                setTicketListings([]);
                return;
            }

            try {
                const res = await axios.get("http://localhost:7000/api/listings", {
                    params: { householdId }
                });
                setTicketListings(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                setTicketListings([]);
            }
        }

        if (activeTab === "tickets") {
            fetchTicketListings();
        }
    }, [activeTab, householdId]);

    // Create support ticket
    async function handleCreateTicket(e) {
        e.preventDefault();
        if (!householdId) {
            setTicketError("Create or join a household before opening a support ticket.");
            return;
        }
        if (!newTicketForm.title.trim() || !newTicketForm.description.trim()) {
            setTicketError("Title and description are required.");
            return;
        }
        try {
            const res = await axios.post("http://localhost:7000/api/supportTicket", {
                householdId,
                reporterId: userId,
                ...newTicketForm,
                apartmentId: newTicketForm.apartmentId || undefined,
                title: newTicketForm.title.trim(),
                description: newTicketForm.description.trim()
            });
            setNewTicketForm({ title: "", description: "", type: "other", priority: "low", apartmentId: "" });
            setShowCreateTicketForm(false);
            setActiveTicketId(res.data._id);
            setTicketError("");
            fetchSupportTickets();
        } catch (err) {
            setTicketError(err.response?.data?.errorMessage || "Failed to create ticket");
        }
    }

    // Add message to support ticket
    async function handleAddTicketMessage(e) {
        e.preventDefault();
        if (!ticketMessageText.trim() || !activeTicketId) return;

        try {
            await axios.post(`http://localhost:7000/api/supportTicket/${activeTicketId}/messages`, {
                supportTicketId: activeTicketId,
                authorId: userId,
                text: ticketMessageText.trim()
            });
            setTicketMessageText("");
            fetchSupportTickets();
        } catch (err) {
            setTicketError(err.response?.data?.errorMessage || "Failed to add message");
        }
    }

    const activeTicket = supportTickets.find(t => t._id === activeTicketId);

    function getTicketListingName(ticket) {
        const listing = ticketListings.find(item => String(item._id) === String(ticket?.apartmentId));
        return listing?.apartmentName || "No apartment selected";
    }

    // Existing message threads logic
    const threads = messages.reduce((threadList, message) => {
        const threadKey = getThreadKey(message, userId);
        if (!threadList[threadKey]) {
            threadList[threadKey] = [];
        }
        threadList[threadKey].push(message);
        return threadList;
    }, {});

    const threadEntries = Object.entries(threads);
    const visibleThreadEntries = threadEntries.filter(([threadKey, threadMessages]) => !isThreadHidden(threadKey, threadMessages));
    const activeThreadMessages = threads[activeThread] || [];
    const activeMessages = isThreadHidden(activeThread, activeThreadMessages) ? [] : activeThreadMessages;
    const activeThreadName = activeMessages.length > 0 ? chatNames[activeThread] || getThreadName(activeMessages, userId) : "Conversation";
    const activeThreadClosed = isSupportThreadClosed(activeMessages);
    const replyTarget = activeThreadClosed ? null : getReplyTarget(activeMessages, userId);

    function isThreadHidden(threadKey, threadMessages) {
        return hiddenChats[threadKey] === getLastMessageId(threadMessages);
    }

    function saveHiddenChats(newHiddenChats) {
        setHiddenChats(newHiddenChats);
        localStorage.setItem(hiddenChatsKey, JSON.stringify(newHiddenChats));
    }

    function saveChatNames(newChatNames) {
        setChatNames(newChatNames);
        localStorage.setItem(chatNamesKey, JSON.stringify(newChatNames));
    }

    function renameChat(threadKey, threadMessages) {
        const currentName = chatNames[threadKey] || getThreadName(threadMessages, userId);
        const newName = window.prompt("Enter a new chat name:", currentName);
        if (newName === null) {
            return;
        }

        const trimmedName = newName.trim();
        const newChatNames = { ...chatNames };
        if (trimmedName) {
            newChatNames[threadKey] = trimmedName;
        } else {
            delete newChatNames[threadKey];
        }
        saveChatNames(newChatNames);
    }

    function hideChat(threadKey, threadMessages) {
        const lastMessageId = getLastMessageId(threadMessages);
        if (!lastMessageId) {
            return;
        }

        const newHiddenChats = { ...hiddenChats, [threadKey]: lastMessageId };
        saveHiddenChats(newHiddenChats);

        if (activeThread === threadKey) {
            const nextVisibleThread = threadEntries.find(([otherThreadKey, otherThreadMessages]) => {
                return otherThreadKey !== threadKey && newHiddenChats[otherThreadKey] !== getLastMessageId(otherThreadMessages);
            });
            setActiveThread(nextVisibleThread ? nextVisibleThread[0] : "");
        }
    }

    async function sendReply(e) {
        e.preventDefault();
        if (!replyText || !replyTarget?.id) {
            return;
        }

        try {
            await axios.post("http://localhost:7000/api/message", {
                senderId: userId,
                senderName: userName,
                receiverId: replyTarget.id,
                receiverName: replyTarget.name,
                listingName: activeMessages[0]?.listingName,
                messageText: replyText,
                isSupportMessage: activeMessages[0]?.isSupportMessage,
                supportChatId: activeMessages[0]?.supportChatId
            });
            setReplyText("");
            setMessageStatus("Reply sent.");
            fetchMessages();
        } catch (err) {
            setMessageStatus(err.response?.data?.errorMessage || "Reply could not be sent.");
        }
    }

    async function sendSupportMessage(e) {
        e.preventDefault();
        const supportChatId = `${userId}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

        try {
            await axios.post("http://localhost:7000/api/message", {
                senderId: userId,
                senderName: userName,
                receiverName: "Support",
                listingName: "Support",
                messageText: supportMessage,
                isSupportMessage: true,
                supportChatId,
                startsSupportChat: true
            });
            setSupportMessage("");
            setActiveThread(`support:${supportChatId}`);
            setMessageStatus("Support message sent.");
            fetchMessages();
        } catch (err) {
            setMessageStatus(err.response?.data?.errorMessage || "Support message could not be sent.");
        }
    }

return (
    <section className="layout">
        <div className="leftSide">
            <div className="sidebar">
                <center><ul>
                    <li><Link to="/Roommates"><figure><img src={require('./images/roommates.png')} className="icon" alt="Roommates"/><figcaption>Roommates</figcaption></figure></Link></li>
                    <li><Link to="/Bills"><figure><img src={require('./images/bill.png')} className="icon" alt="Bills"/><figcaption>Bills</figcaption></figure></Link></li>
                    <li><Link to="/Calendar"><figure><img src={require('./images/calendar.png')} className="icon" alt="Calendar"/><figcaption>Calendar</figcaption></figure></Link></li>
                    <li><Link to="/Lists"><figure><img src={require('./images/list.png')} className="icon" alt="Lists"/><figcaption>Lists</figcaption></figure></Link></li>
                    <li className="active"><Link to="/Messages"><figure><img src={require('./images/dm.png')} className="icon" alt="Messages"/><figcaption>Messages</figcaption></figure></Link></li>
                    <li><Link to="/Settings"><figure><img src={require('./images/settings.png')} className="icon" alt="Settings"/><figcaption>Settings</figcaption></figure></Link></li>
                </ul></center>
            </div>
        </div>

        <div className="body" style={{ display: "flex", flexDirection: "column" }}>
            {/* Tab buttons */}
            <div style={{ display: "flex", borderBottom: "1px solid #ddd", padding: "10px 20px", backgroundColor: "#f5f5f5" }}>
                <button
                    onClick={() => setActiveTab("messages")}
                    style={{
                        padding: "10px 20px",
                        marginRight: "10px",
                        backgroundColor: activeTab === "messages" ? "#68B684" : "transparent",
                        color: activeTab === "messages" ? "white" : "black",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: activeTab === "messages" ? "bold" : "normal"
                    }}
                >
                    Messages
                </button>
                <button
                    onClick={() => setActiveTab("tickets")}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: activeTab === "tickets" ? "#68B684" : "transparent",
                        color: activeTab === "tickets" ? "white" : "black",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: activeTab === "tickets" ? "bold" : "normal"
                    }}
                >
                    Support Tickets
                </button>
            </div>

            {/* Messages Tab */}
            {activeTab === "messages" && (
                <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                    {/* Thread list */}
                    <div style={{ width: "30%", borderRight: "1px solid #ddd", overflowY: "auto" }}>
                        <div style={{ padding: "15px" }}>
                            <h3>Conversations</h3>
                            {visibleThreadEntries.map(([threadKey, threadMessages]) => (
                                <div
                                    key={threadKey}
                                    onClick={() => setActiveThread(threadKey)}
                                    style={{
                                        padding: "10px",
                                        marginBottom: "10px",
                                        backgroundColor: activeThread === threadKey ? "#e8f5e9" : "#fff",
                                        border: "1px solid #ddd",
                                        borderRadius: "5px",
                                        cursor: "pointer"
                                    }}
                                >
                                    <p style={{ margin: "0", fontWeight: activeThread === threadKey ? "bold" : "normal" }}>
                                        {chatNames[threadKey] || getThreadName(threadMessages, userId)}
                                    </p>
                                    <small>{threadMessages.length} messages</small>
                                    <div style={{ marginTop: "8px" }}>
                                        <button
                                            className="smallChatButton"
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                renameChat(threadKey, threadMessages);
                                            }}
                                        >
                                            Rename
                                        </button>
                                        <button
                                            className="smallChatButton deleteChatButton"
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                hideChat(threadKey, threadMessages);
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active thread or empty state */}
                    <div style={{ width: "70%", display: "flex", flexDirection: "column", padding: "20px", overflowY: "auto" }}>
                        {activeMessages.length === 0 ? (
                            <div>
                                <h3>No messages yet</h3>
                                <form onSubmit={sendSupportMessage} style={{ marginTop: "20px" }}>
                                    <textarea
                                        value={supportMessage}
                                        onChange={e => setSupportMessage(e.target.value)}
                                        placeholder="Start a support conversation..."
                                        style={{ width: "100%", minHeight: "80px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                                    />
                                    <button className="btnGreen" type="submit" style={{ marginTop: "10px" }}>Send Support Message</button>
                                </form>
                            </div>
                        ) : (
                            <>
                                <h3>{activeThreadName}</h3>
                                <div style={{ flex: 1, overflowY: "auto", marginBottom: "20px", border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
                                    {activeMessages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                marginBottom: "15px",
                                                padding: "10px",
                                                backgroundColor: isOutgoingMessage(msg, userId) ? "#c8e6c9" : "#fff9c4",
                                                borderRadius: "5px",
                                                textAlign: isOutgoingMessage(msg, userId) ? "right" : "left"
                                            }}
                                        >
                                            <p style={{ margin: "0 0 5px 0" }}>
                                                <strong>{msg.senderName || "User"}</strong>
                                            </p>
                                            <p style={{ margin: "0" }}>{msg.messageText}</p>
                                            <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
                                        </div>
                                    ))}
                                </div>

                                {!activeThreadClosed && replyTarget && (
                                    <form onSubmit={sendReply}>
                                        <textarea
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            placeholder={`Reply to ${replyTarget.name}...`}
                                            style={{ width: "100%", minHeight: "60px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                                        />
                                        <button className="btnGreen" type="submit" style={{ marginTop: "10px" }}>Send Reply</button>
                                    </form>
                                )}

                                {messageStatus && <p style={{ color: "green", marginTop: "10px" }}>{messageStatus}</p>}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Support Tickets Tab */}
            {activeTab === "tickets" && (
                <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                    {/* Ticket list */}
                    <div style={{ width: "30%", borderRight: "1px solid #ddd", overflowY: "auto", padding: "15px" }}>
                        <h3>Support Tickets</h3>
                        
                        {/* Filters */}
                        <div style={{ marginBottom: "15px" }}>
                            <select 
                                value={ticketFilters.type} 
                                onChange={e => setTicketFilters({ ...ticketFilters, type: e.target.value })}
                                style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "3px", border: "1px solid #ccc", boxSizing: "border-box" }}
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
                                style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "3px", border: "1px solid #ccc", boxSizing: "border-box" }}
                            >
                                <option value="">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                            <select
                                value={ticketFilters.apartmentId}
                                onChange={e => setTicketFilters({ ...ticketFilters, apartmentId: e.target.value })}
                                style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "3px", border: "1px solid #ccc", boxSizing: "border-box" }}
                            >
                                <option value="">All Apartments</option>
                                {ticketListings.map(listing => (
                                    <option key={listing._id} value={listing._id}>{listing.apartmentName}</option>
                                ))}
                            </select>
                        </div>

                        <button className="btnGreen" onClick={() => setShowCreateTicketForm(!showCreateTicketForm)} style={{ marginBottom: "15px", width: "100%" }}>
                            {showCreateTicketForm ? "Cancel" : "+ New Ticket"}
                        </button>

                        {showCreateTicketForm && (
                            <form onSubmit={handleCreateTicket} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}>
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={newTicketForm.title}
                                    onChange={e => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                                    required
                                    style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "3px", border: "1px solid #ccc", boxSizing: "border-box" }}
                                />
                                <textarea
                                    placeholder="Description"
                                    value={newTicketForm.description}
                                    onChange={e => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                                    required
                                    style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "3px", border: "1px solid #ccc", boxSizing: "border-box" }}
                                />
                                <select value={newTicketForm.type} onChange={e => setNewTicketForm({ ...newTicketForm, type: e.target.value })} style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "3px", border: "1px solid #ccc", boxSizing: "border-box" }}>
                                    <option value="apartment">Apartment</option>
                                    <option value="billing">Billing</option>
                                    <option value="safety">Safety</option>
                                    <option value="bug">Bug</option>
                                    <option value="other">Other</option>
                                </select>
                                <select value={newTicketForm.priority} onChange={e => setNewTicketForm({ ...newTicketForm, priority: e.target.value })} style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "3px", border: "1px solid #ccc", boxSizing: "border-box" }}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                                <select value={newTicketForm.apartmentId} onChange={e => setNewTicketForm({ ...newTicketForm, apartmentId: e.target.value })} style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "3px", border: "1px solid #ccc", boxSizing: "border-box" }}>
                                    <option value="">No apartment selected</option>
                                    {ticketListings.map(listing => (
                                        <option key={listing._id} value={listing._id}>{listing.apartmentName}</option>
                                    ))}
                                </select>
                                <button className="btnGreen" type="submit" style={{ width: "100%" }}>Create</button>
                            </form>
                        )}

                        {ticketError && <p style={{ color: "red" }}>{ticketError}</p>}

                        <div>
                            {supportTickets.length === 0 ? (
                                <p>No support tickets yet.</p>
                            ) : (
                                supportTickets.map(ticket => (
                                    <div
                                        key={ticket._id}
                                        onClick={() => setActiveTicketId(ticket._id)}
                                        style={{
                                            padding: "10px",
                                            marginBottom: "10px",
                                            backgroundColor: activeTicketId === ticket._id ? "#e8f5e9" : "#fff",
                                            border: "1px solid #ddd",
                                            borderRadius: "5px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <p style={{ margin: "0", fontWeight: "bold" }}>{ticket.title}</p>
                                        <small style={{ color: "#666" }}>Status: {ticket.status}</small>
                                        <br />
                                        <small style={{ color: "#666" }}>Apartment: {getTicketListingName(ticket)}</small>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Ticket detail */}
                    <div style={{ width: "70%", padding: "20px", overflowY: "auto" }}>
                        {!activeTicket ? (
                            <p>Select a ticket to view details.</p>
                        ) : (
                            <>
                                <h3>{activeTicket.title}</h3>
                                <p><strong>Type:</strong> {activeTicket.type}</p>
                                <p><strong>Apartment:</strong> {getTicketListingName(activeTicket)}</p>
                                <p><strong>Priority:</strong> {activeTicket.priority}</p>
                                <p><strong>Status:</strong> {activeTicket.status}</p>
                                <p><strong>Description:</strong> {activeTicket.description}</p>
                                <p><strong>Created:</strong> {new Date(activeTicket.createdAt).toLocaleString()}</p>

                                <hr style={{ margin: "20px 0" }} />

                                <h4>Messages</h4>
                                <div style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "5px", maxHeight: "250px", overflowY: "auto", marginBottom: "15px" }}>
                                    {(!activeTicket.messages || activeTicket.messages.length === 0) ? (
                                        <p>No messages yet.</p>
                                    ) : (
                                        activeTicket.messages.map((msg, idx) => (
                                            <div key={idx} style={{ marginBottom: "10px", padding: "8px", backgroundColor: "#f9f9f9", borderRadius: "3px" }}>
                                                <p style={{ margin: "0", fontWeight: "bold", fontSize: "12px" }}>{String(msg.authorId) === String(userId) ? "You" : "Support"}</p>
                                                <p style={{ margin: "5px 0 0 0" }}>{msg.text}</p>
                                                <small>{new Date(msg.createdAt).toLocaleString()}</small>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form onSubmit={handleAddTicketMessage}>
                                    <textarea
                                        value={ticketMessageText}
                                        onChange={e => setTicketMessageText(e.target.value)}
                                        placeholder="Add a message to this ticket..."
                                        style={{ width: "100%", minHeight: "60px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }}
                                    />
                                    <button className="btnGreen" type="submit" style={{ marginTop: "10px" }}>Send Message</button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    </section>
);
};

export default Messages;
