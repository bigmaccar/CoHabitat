import { Link } from "react-router-dom";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

function splitTags(value) {
    return value.split(",").map(tag => tag.trim()).filter(Boolean);
}

function splitPhotoUrls(value) {
    return value
        .split(/\n|,/)
        .map(url => url.trim())
        .filter(Boolean)
        .map(url => ({ url }));
}

const emptyForm = {
    apartmentName: "",
    description: "",
    rentAmount: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    photoUrls: "",
    houseRules: "",
    lifestyleTags: "",
    idealRoommateTags: ""
};

function ApartmentListing(){
    const userId = localStorage.getItem("userId");
    const householdId = localStorage.getItem("householdId");
    const [listings, setListings] = useState([]);
    const [formData, setFormData] = useState(emptyForm);
    const [editingListingId, setEditingListingId] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchListings = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get("http://localhost:7000/api/listings", {
                params: { createdBy: userId }
            });
            setListings(Array.isArray(res.data) ? res.data : []);
            setMessage("");
        } catch (err) {
            setMessage(err.response?.data?.errorMessage || "Listings could not be loaded.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    function updateForm(field, value) {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    function clearForm() {
        setFormData(emptyForm);
        setEditingListingId("");
    }

    function startEdit(listing) {
        setEditingListingId(listing._id);
        setFormData({
            apartmentName: listing.apartmentName || "",
            description: listing.description || "",
            rentAmount: listing.rentAmount || "",
            address: listing.address || "",
            city: listing.city || "",
            state: listing.state || "",
            zipCode: listing.zipCode || "",
            photoUrls: Array.isArray(listing.photos) ? listing.photos.map(photo => photo.url).filter(Boolean).join("\n") : "",
            houseRules: listing.houseRules || "",
            lifestyleTags: Array.isArray(listing.lifestyleTags) ? listing.lifestyleTags.join(", ") : "",
            idealRoommateTags: Array.isArray(listing.idealRoommateTags) ? listing.idealRoommateTags.join(", ") : ""
        });
        setMessage("");
    }

    function getPayload() {
        return {
            householdId,
            createdBy: userId,
            apartmentName: formData.apartmentName.trim(),
            description: formData.description.trim(),
            rentAmount: parseFloat(formData.rentAmount),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            zipCode: formData.zipCode.trim(),
            location: [formData.city.trim(), formData.state.trim()].filter(Boolean).join(", "),
            photos: splitPhotoUrls(formData.photoUrls),
            houseRules: formData.houseRules.trim(),
            lifestyleTags: splitTags(formData.lifestyleTags),
            idealRoommateTags: splitTags(formData.idealRoommateTags)
        };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!householdId) {
            setMessage("Create or join a household before listing an apartment.");
            return;
        }
        if (!formData.apartmentName.trim() || !formData.rentAmount || !formData.city.trim() || !formData.state.trim()) {
            setMessage("Apartment name, rent, city, and state are required.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = getPayload();
            if (editingListingId) {
                await axios.put("http://localhost:7000/api/update/listing/" + editingListingId, payload);
                setMessage("Listing updated successfully.");
            } else {
                await axios.post("http://localhost:7000/api/listing", payload);
                setMessage("Listing created successfully.");
            }
            clearForm();
            fetchListings();
        } catch (err) {
            setMessage(err.response?.data?.message || err.response?.data?.errorMessage || "Listing could not be saved.");
        } finally {
            setSubmitting(false);
        }
    }

    async function updateListing(listing, updates, successMessage) {
        try {
            await axios.put("http://localhost:7000/api/update/listing/" + listing._id, updates);
            setMessage(successMessage);
            fetchListings();
        } catch (err) {
            setMessage(err.response?.data?.errorMessage || "Listing could not be updated.");
        }
    }

    function updateApplicant(listing, applicantId, status) {
        const updatedApplicants = (listing.applicants || []).map(applicant => {
            if (applicant._id === applicantId) {
                return { ...applicant, status };
            }
            return applicant;
        });
        updateListing(listing, { applicants: updatedApplicants }, `Applicant ${status}.`);
    }

    function blacklistApplicant(listing, applicant) {
        const blacklistedUserIds = new Set((listing.blacklistedUserIds || []).map(String));
        blacklistedUserIds.add(String(applicant.userId));
        const updatedApplicants = (listing.applicants || []).map(item => {
            if (item._id === applicant._id) {
                return { ...item, status: "declined" };
            }
            return item;
        });
        updateListing(listing, {
            applicants: updatedApplicants,
            blacklistedUserIds: Array.from(blacklistedUserIds)
        }, "Applicant blacklisted.");
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
            <div className="body" style={{ padding: "20px" }}>
                <h1>List Apartment</h1>
                {message && <p>{message}</p>}

                <form className="billAddForm" onSubmit={handleSubmit}>
                    <h2>{editingListingId ? "Edit Listing" : "Create Listing"}</h2>
                    <div>
                        <label>Apartment Name</label>
                        <input type="text" value={formData.apartmentName} onChange={e => updateForm("apartmentName", e.target.value)} required />
                    </div>
                    <div>
                        <label>Rent Amount</label>
                        <input type="number" value={formData.rentAmount} onChange={e => updateForm("rentAmount", e.target.value)} min="0" step="0.01" required />
                    </div>
                    <div>
                        <label>Address</label>
                        <input type="text" value={formData.address} onChange={e => updateForm("address", e.target.value)} />
                    </div>
                    <div>
                        <label>City</label>
                        <input type="text" value={formData.city} onChange={e => updateForm("city", e.target.value)} required />
                    </div>
                    <div>
                        <label>State</label>
                        <input type="text" value={formData.state} onChange={e => updateForm("state", e.target.value)} required />
                    </div>
                    <div>
                        <label>Zip Code</label>
                        <input type="text" value={formData.zipCode} onChange={e => updateForm("zipCode", e.target.value)} />
                    </div>
                    <div>
                        <label>Description</label>
                        <textarea value={formData.description} onChange={e => updateForm("description", e.target.value)} />
                    </div>
                    <div>
                        <label>Photo URLs</label>
                        <textarea value={formData.photoUrls} onChange={e => updateForm("photoUrls", e.target.value)} placeholder="One image URL per line" />
                    </div>
                    <div>
                        <label>House Rules</label>
                        <textarea value={formData.houseRules} onChange={e => updateForm("houseRules", e.target.value)} />
                    </div>
                    <div>
                        <label>Apartment Lifestyle Tags</label>
                        <input type="text" value={formData.lifestyleTags} onChange={e => updateForm("lifestyleTags", e.target.value)} placeholder="quiet, close to campus" />
                    </div>
                    <div>
                        <label>Ideal Roommate Preferences</label>
                        <input type="text" value={formData.idealRoommateTags} onChange={e => updateForm("idealRoommateTags", e.target.value)} placeholder="clean, no smoking" />
                    </div>
                    <button className="btnGreen" type="submit" disabled={submitting}>{submitting ? "Saving..." : editingListingId ? "Save Listing" : "Create Listing"}</button>
                    {editingListingId && <button className="btnOutline" type="button" onClick={clearForm}>Cancel Edit</button>}
                </form>

                <hr style={{ margin: "20px 0" }} />

                <h2>Your Listings</h2>
                {loading && <p>Loading listings...</p>}
                {!loading && listings.length === 0 && <p>No listings yet. Create one above.</p>}

                {listings.map(listing => (
                    <div key={listing._id} className="listingStatusCard" style={{ marginBottom: "20px" }}>
                        <h3>{listing.apartmentName || "Untitled Listing"}</h3>
                        <p>{listing.location || [listing.city, listing.state].filter(Boolean).join(", ")}</p>
                        <p>Rent: ${listing.rentAmount || 0}</p>
                        <p>{listing.isActive === false ? "Filled - inquiries are closed." : "Open - accepting inquiries."}</p>
                        {listing.houseRules && <p><strong>House Rules:</strong> {listing.houseRules}</p>}
                        {Array.isArray(listing.idealRoommateTags) && listing.idealRoommateTags.length > 0 && (
                            <p><strong>Ideal Roommate:</strong> {listing.idealRoommateTags.join(", ")}</p>
                        )}
                        <button className="btnOutline" type="button" onClick={() => startEdit(listing)}>Edit Listing</button>
                        <button className="btnGreen" type="button" onClick={() => updateListing(listing, { isActive: true }, "Listing reopened.")} disabled={listing.isActive !== false}>Reopen Listing</button>
                        <button className="btnRed" type="button" onClick={() => updateListing(listing, { isActive: false }, "Listing marked as filled.")} disabled={listing.isActive === false}>Mark as Filled</button>

                        <h4>Applicants</h4>
                        {!listing.applicants || listing.applicants.length === 0 ? (
                            <p>No applicants yet.</p>
                        ) : (
                            listing.applicants.map(applicant => {
                                const isBlacklisted = (listing.blacklistedUserIds || []).map(String).includes(String(applicant.userId));
                                return (
                                    <div key={applicant._id} style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}>
                                        <p><strong>{applicant.name || applicant.email || "Applicant"}</strong></p>
                                        {applicant.email && <p>{applicant.email}</p>}
                                        {applicant.message && <p>{applicant.message}</p>}
                                        <p>Status: {isBlacklisted ? "blacklisted" : applicant.status || "pending"}</p>
                                        <Link to={`/TenantProfile?userId=${applicant.userId}&listingId=${listing._id}`}>View Applicant Profile</Link>
                                        <div style={{ marginTop: "10px" }}>
                                            <button className="btnGreen" type="button" onClick={() => updateApplicant(listing, applicant._id, "accepted")} disabled={isBlacklisted}>Accept</button>
                                            <button className="btnOutline" type="button" onClick={() => updateApplicant(listing, applicant._id, "declined")} disabled={isBlacklisted}>Decline</button>
                                            <button className="btnRed" type="button" onClick={() => blacklistApplicant(listing, applicant)} disabled={isBlacklisted}>Blacklist</button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default ApartmentListing;
