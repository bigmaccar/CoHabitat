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
    const [supportMessages, setSupportMessages] = useState([]);
    const [activeSenderId, setActiveSenderId] = useState("");
    const [replyText, setReplyText] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
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
                <h1>Support Messages</h1>
                {statusMessage && <p>{statusMessage}</p>}

                <div className="chatLayout">
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
                </div>
            </div>
        </section>
    );
}

export default Tickets;
