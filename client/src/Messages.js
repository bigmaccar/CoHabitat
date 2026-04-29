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

function createSupportChatId(userId) {
    return `${userId}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
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
    const userName = localStorage.getItem("userName") || "User";
    const hiddenChatsKey = `hiddenMessageChats_${userId}`;
    const chatNamesKey = `messageChatNames_${userId}`;
    const [messages, setMessages] = useState([]);
    const [activeThread, setActiveThread] = useState("");
    const [supportMessage, setSupportMessage] = useState("");
    const [replyText, setReplyText] = useState("");
    const [messageStatus, setMessageStatus] = useState("");
    const [hiddenChats, setHiddenChats] = useState(() => getSavedChatMap(hiddenChatsKey));
    const [chatNames, setChatNames] = useState(() => getSavedData(chatNamesKey, {}));

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

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

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
        const supportChatId = createSupportChatId(userId);

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
                        <li><Link to="/Roommates"><figure><img src={require("./images/roommates.png")} className="icon" alt="Roommates"/><figcaption>Roommates</figcaption></figure></Link></li>
                        <li><Link to="/Bills"><figure><img src={require("./images/bill.png")} className="icon" alt="Bills"/><figcaption>Bills</figcaption></figure></Link></li>
                        <li><Link to="/Calendar"><figure><img src={require("./images/calendar.png")} className="icon" alt="Calendar"/><figcaption>Calendar</figcaption></figure></Link></li>
                        <li><Link to="/Lists"><figure><img src={require("./images/list.png")} className="icon" alt="Lists"/><figcaption>Lists</figcaption></figure></Link></li>
                        <li><Link to="/Settings"><figure><img src={require("./images/settings.png")} className="icon" alt="Settings"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body messagePage">
                <h1>Messages</h1>
                {messageStatus && <p>{messageStatus}</p>}

                <form className="messagePanel supportComposer" onSubmit={sendSupportMessage}>
                    <h2>Contact Support</h2>
                    <textarea
                        value={supportMessage}
                        onChange={e => setSupportMessage(e.target.value)}
                        placeholder="Describe your support issue."
                        required
                    />
                    <button type="submit">Send to Support</button>
                </form>

                <div className="chatLayout">
                    <div className="threadList">
                        <h2>Conversations</h2>
                        {threadEntries.length === 0 ? (
                            <p>No conversations yet.</p>
                        ) : visibleThreadEntries.length === 0 ? (
                            <p>No visible conversations.</p>
                        ) : (
                            visibleThreadEntries.map(([threadKey, threadMessages]) => (
                                <div className="threadItem" key={threadKey}>
                                    <button
                                        className={activeThread === threadKey ? "threadButton activeThread" : "threadButton"}
                                        onClick={() => setActiveThread(threadKey)}
                                    >
                                        {chatNames[threadKey] || getThreadName(threadMessages, userId)}
                                        {threadKey.startsWith("support:") && isSupportThreadClosed(threadMessages) ? " (Ended)" : ""}
                                    </button>
                                    <button className="smallChatButton" type="button" onClick={() => renameChat(threadKey, threadMessages)}>Rename</button>
                                    <button className="smallChatButton deleteChatButton" type="button" onClick={() => hideChat(threadKey, threadMessages)}>Delete</button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="chatWindow">
                        <h2>{activeThreadName}</h2>
                        {activeMessages.length === 0 ? (
                            <p>Select a conversation.</p>
                        ) : (
                            activeMessages.map(message => (
                                <div
                                    className={isSupportEndMessage(message) ? "chatBubble systemBubble" : isOutgoingMessage(message, userId) ? "chatBubble outgoingBubble" : "chatBubble incomingBubble"}
                                    key={message._id}
                                >
                                    <p>{message.messageText}</p>
                                    {!isSupportEndMessage(message) && <small>{isOutgoingMessage(message, userId) ? "You" : message.senderName || "User"}</small>}
                                </div>
                            ))
                        )}
                        {activeThreadClosed && <p className="closedChatNotice">This support chat has been ended. Use Start New Support Chat to contact support again.</p>}
                        {replyTarget && (
                            <form className="chatReplyForm" onSubmit={sendReply}>
                                <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="Write a reply."
                                    required
                                />
                                <button type="submit">Send Reply</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Messages;
