import { Link } from "react-router-dom";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

function splitTags(value) {
    return value.split(",").map(tag => tag.trim()).filter(Boolean);
}

function Settings() {
    const userId = localStorage.getItem("userId");
    const [householdId, setHouseholdId] = useState(localStorage.getItem("householdId") || "");

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [maxOccupants, setMaxOccupants] = useState("");
    const [household, setHousehold] = useState(null);
    const [joinHouseholdId, setJoinHouseholdId] = useState("");
    const [householdMessage, setHouseholdMessage] = useState("");

    const [profileLoading, setProfileLoading] = useState(true);
    const [profileMessage, setProfileMessage] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [preferredLocation, setPreferredLocation] = useState("");
    const [budgetMin, setBudgetMin] = useState("");
    const [budgetMax, setBudgetMax] = useState("");
    const [lifestyleTags, setLifestyleTags] = useState("");

    const fetchHousehold = useCallback(async () => {
        if (!householdId) {
            setHousehold(null);
            return;
        }

        try {
            const res = await axios.get("http://localhost:7000/api/household", {
                params: { id: householdId }
            });
            setHousehold(res.data);
        } catch (err) {
            localStorage.removeItem("householdId");
            setHouseholdId("");
            setHousehold(null);
            setHouseholdMessage("Household could not be loaded.");
        }
    }, [householdId]);

    useEffect(() => {
        async function fetchProfile() {
            if (!userId) {
                setProfileLoading(false);
                return;
            }

            try {
                const res = await axios.get("http://localhost:7000/api/user", {
                    params: { _id: userId }
                });
                const user = res.data;
                setFirstName(user.firstName || "");
                setLastName(user.lastName || "");
                setEmail(user.email || "");
                setBio(user.bio || "");
                setPreferredLocation(user.preferredLocation || "");
                setBudgetMin(user.budgetMin ?? "");
                setBudgetMax(user.budgetMax ?? "");
                setLifestyleTags(Array.isArray(user.lifestyleTags) ? user.lifestyleTags.join(", ") : "");
                if (!householdId && user.households && user.households.length > 0) {
                    const firstHouseholdId = user.households[0].householdId;
                    localStorage.setItem("householdId", firstHouseholdId);
                    setHouseholdId(firstHouseholdId);
                }
                setProfileMessage("");
            } catch (err) {
                setProfileMessage(err.response?.data?.message || "Profile could not be loaded.");
            } finally {
                setProfileLoading(false);
            }
        }

        fetchProfile();
    }, [householdId, userId]);

    useEffect(() => {
        fetchHousehold();
    }, [fetchHousehold]);

    async function handleUpdateProfile(e) {
        e.preventDefault();
        const cleanFirstName = firstName.trim();
        const cleanLastName = lastName.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanFirstName || !cleanLastName || !cleanEmail) {
            setProfileMessage("First name, last name, and email are required.");
            return;
        }
        if (!cleanEmail.includes("@")) {
            setProfileMessage("Please enter a valid email address.");
            return;
        }

        try {
            const res = await axios.put("http://localhost:7000/api/update/user/" + userId, {
                firstName: cleanFirstName,
                lastName: cleanLastName,
                email: cleanEmail,
                bio: bio.trim(),
                preferredLocation: preferredLocation.trim(),
                budgetMin: budgetMin === "" ? null : parseFloat(budgetMin),
                budgetMax: budgetMax === "" ? null : parseFloat(budgetMax),
                lifestyleTags: splitTags(lifestyleTags)
            });
            const updatedUser = res.data;
            localStorage.setItem("userName", `${updatedUser.firstName || ""} ${updatedUser.lastName || ""}`.trim() || updatedUser.email);
            localStorage.setItem("userEmail", updatedUser.email);
            setProfileMessage("Profile updated successfully.");
        } catch (err) {
            setProfileMessage(err.response?.data?.message || "Profile could not be updated.");
        }
    }

    async function handleCreateHousehold(e) {
        e.preventDefault();
        if (!name.trim()) {
            setHouseholdMessage("Household name is required.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:7000/api/household", {
                name,
                address,
                city,
                state,
                zipCode,
                maxOccupants: maxOccupants ? parseInt(maxOccupants, 10) : undefined,
                createdBy: userId
            });
            localStorage.setItem("householdId", res.data._id);
            setHouseholdId(res.data._id);
            setHousehold(res.data);
            setHouseholdMessage("Household created successfully.");
            setShowForm(false);
            setName("");
            setAddress("");
            setCity("");
            setState("");
            setZipCode("");
            setMaxOccupants("");
        } catch (err) {
            setHouseholdMessage(err.response?.data?.message || err.response?.data?.errorMessage || "Failed to create household.");
        }
    }

    async function handleJoinHousehold(e) {
        e.preventDefault();
        const cleanHouseholdId = joinHouseholdId.trim();
        if (!cleanHouseholdId) {
            setHouseholdMessage("Household ID is required.");
            return;
        }

        try {
            await axios.post("http://localhost:7000/api/household/" + cleanHouseholdId + "/members", {
                userId
            });
            localStorage.setItem("householdId", cleanHouseholdId);
            setHouseholdId(cleanHouseholdId);
            setJoinHouseholdId("");
            setHouseholdMessage("Joined household successfully.");
        } catch (err) {
            setHouseholdMessage(err.response?.data?.message || err.response?.data?.errorMessage || "Failed to join household.");
        }
    }

    async function handleLeaveHousehold() {
        try {
            await axios.delete("http://localhost:7000/api/household/" + householdId + "/members/" + userId);
            localStorage.removeItem("householdId");
            setHouseholdId("");
            setHousehold(null);
            setHouseholdMessage("Left household successfully.");
        } catch (err) {
            setHouseholdMessage(err.response?.data?.message || err.response?.data?.errorMessage || "Failed to leave household.");
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
                        <li className="active"><Link to="/Settings"><figure><img src={require("./images/settings.png")} className="icon" alt="Settings"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body" style={{ padding: "20px" }}>
                <h1>Settings</h1>

                <h2>Profile</h2>
                {profileLoading ? (
                    <p>Loading profile...</p>
                ) : (
                    <form className="billAddForm" onSubmit={handleUpdateProfile}>
                        <div>
                            <label>First Name</label>
                            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                        </div>
                        <div>
                            <label>Last Name</label>
                            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required />
                        </div>
                        <div>
                            <label>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label>Bio</label>
                            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell potential roommates about yourself." />
                        </div>
                        <div>
                            <label>Preferred Location</label>
                            <input type="text" value={preferredLocation} onChange={e => setPreferredLocation(e.target.value)} placeholder="Albany, NY" />
                        </div>
                        <div>
                            <label>Minimum Budget</label>
                            <input type="number" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} min="0" />
                        </div>
                        <div>
                            <label>Maximum Budget</label>
                            <input type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} min="0" />
                        </div>
                        <div>
                            <label>Lifestyle Preferences</label>
                            <input type="text" value={lifestyleTags} onChange={e => setLifestyleTags(e.target.value)} placeholder="quiet, clean, early riser" />
                        </div>
                        <button className="btnGreen" type="submit">Save Profile</button>
                    </form>
                )}
                {profileMessage && <p style={{ color: profileMessage.includes("success") ? "green" : "red" }}>{profileMessage}</p>}

                <hr style={{ margin: "20px 0" }} />

                <Link to="/ApartmentListing" style={{ fontSize: 20 }}>List Your Apartment</Link>

                <hr style={{ margin: "20px 0" }} />

                <h2>Household</h2>
                {household ? (
                    <div>
                        <p><strong>{household.name}</strong></p>
                        <p>Household ID: {household._id}</p>
                        <p>{[household.address, household.city, household.state, household.zipCode].filter(Boolean).join(", ")}</p>
                        {household.maxOccupants && <p>Max occupants: {household.maxOccupants}</p>}
                        <button className="btnRed" type="button" onClick={handleLeaveHousehold}>Leave Household</button>
                    </div>
                ) : (
                    <p>You are not part of a household yet.</p>
                )}

                {!household && (
                    <>
                        <button className="btnGreen" onClick={() => setShowForm(!showForm)}>
                            {showForm ? "Cancel" : "Create Household"}
                        </button>

                        <form className="billAddForm" onSubmit={handleJoinHousehold}>
                            <h3>Join Household</h3>
                            <label>Household ID</label>
                            <input type="text" value={joinHouseholdId} onChange={e => setJoinHouseholdId(e.target.value)} placeholder="Paste household ID" />
                            <button className="btnGreen" type="submit">Join</button>
                        </form>
                    </>
                )}

                {householdMessage && <p style={{ color: householdMessage.includes("success") || householdMessage.includes("Joined") || householdMessage.includes("Left") ? "green" : "red" }}>{householdMessage}</p>}

                {showForm && (
                    <form className="billAddForm" onSubmit={handleCreateHousehold}>
                        <div>
                            <label>Household Name</label>
                            <input type="text" placeholder="e.g. The Green House" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div>
                            <label>Address</label>
                            <input type="text" placeholder="123 Main St" value={address} onChange={e => setAddress(e.target.value)} />
                        </div>
                        <div>
                            <label>City</label>
                            <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
                        </div>
                        <div>
                            <label>State</label>
                            <input type="text" placeholder="State" value={state} onChange={e => setState(e.target.value)} />
                        </div>
                        <div>
                            <label>Zip Code</label>
                            <input type="text" placeholder="12345" value={zipCode} onChange={e => setZipCode(e.target.value)} />
                        </div>
                        <div>
                            <label>Max Occupants</label>
                            <input type="number" placeholder="e.g. 4" value={maxOccupants} onChange={e => setMaxOccupants(e.target.value)} min="1" />
                        </div>
                        <button className="btnGreen" type="submit">Create</button>
                    </form>
                )}

                <Link to="/SubmitTicket" style={{ fontSize: 20 }}>Submit a Ticket</Link>
            </div>
        </section>
    );
}

export default Settings;
