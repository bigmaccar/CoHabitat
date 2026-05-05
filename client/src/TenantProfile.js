import { Link, useSearchParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

function getFullName(user) {
    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email || "Tenant";
}

function TenantProfile(){
    const [searchParams] = useSearchParams();
    const profileUserId = searchParams.get("userId");
    const listingId = searchParams.get("listingId");
    const [tenant, setTenant] = useState(null);
    const [listing, setListing] = useState(null);
    const [message, setMessage] = useState("Loading tenant profile...");

    useEffect(() => {
        async function fetchProfile() {
            try {
                let loadedListing = null;
                if (listingId) {
                    const listingRes = await axios.get("http://localhost:7000/api/listing", {
                        params: { id: listingId }
                    });
                    loadedListing = listingRes.data;
                    setListing(loadedListing);
                }

                const userId = profileUserId || loadedListing?.createdBy;
                if (!userId) {
                    setMessage("No tenant was selected.");
                    return;
                }

                const userRes = await axios.get("http://localhost:7000/api/user", {
                    params: { id: userId }
                });
                setTenant(userRes.data);
                setMessage("");
            } catch (err) {
                setMessage(err.response?.data?.message || "Tenant profile could not be loaded.");
            }
        }

        fetchProfile();
    }, [listingId, profileUserId]);

    const backLink = listingId ? `/Apartment?id=${listingId}` : "/Search";

    return (
        <section className="layoutApartment">
            <div className="sidebarApartment">
                <div className="apartmentPage">
                    <Link to={backLink}>Back to Apartment</Link>
                    <h1>{tenant ? getFullName(tenant) : "Tenant Profile"}</h1>
                    <img src={require("./images/person.png")} className="tenantProfileImage" alt="Tenant profile"/>
                </div>
            </div>
            <div className="bodyApartment">
                <div className="apartmentPage2">
                    <h1>Tenant Profile</h1>
                    {message && <p>{message}</p>}
                    {tenant && (
                        <>
                            <p><strong>Email:</strong> {tenant.email}</p>
                            <p><strong>Current Apartment:</strong> {listing?.apartmentName || "Not listed"}</p>
                            {tenant.bio && <p><strong>About:</strong> {tenant.bio}</p>}
                            {tenant.preferredLocation && <p><strong>Preferred Location:</strong> {tenant.preferredLocation}</p>}
                            {(tenant.budgetMin || tenant.budgetMax) && (
                                <p><strong>Budget:</strong> ${tenant.budgetMin || 0} - ${tenant.budgetMax || "No max"}</p>
                            )}
                            {Array.isArray(tenant.lifestyleTags) && tenant.lifestyleTags.length > 0 && (
                                <p><strong>Lifestyle Preferences:</strong> {tenant.lifestyleTags.join(", ")}</p>
                            )}
                            {listing?.idealRoommateTags?.length > 0 && (
                                <p><strong>Listing Roommate Preferences:</strong> {listing.idealRoommateTags.join(", ")}</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

export default TenantProfile;
