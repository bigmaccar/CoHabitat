import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

const apartments = [
    {
        id: "apartment-1",
        name: "Apartment 1",
        image: require("./images/apartment1.jpg"),
        description: "Two bedroom apartment near campus.",
        rent: "$1200/month",
        location: "Albany, NY"
    },
    {
        id: "apartment-2",
        name: "Apartment 2",
        image: require("./images/apartment2.jpg"),
        description: "Quiet apartment with shared living space.",
        rent: "$950/month",
        location: "Troy, NY"
    }
];

function Search(){
    const [savedListings, setSavedListings] = useState([]);
    const [savedError, setSavedError] = useState("");

    useEffect(() => {
        fetchSavedListings();
    }, []);

    async function fetchSavedListings() {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            return;
        }

        try {
            const res = await axios.get("http://localhost:7000/api/savedListings", {
                params: { userId }
            });
            setSavedListings(res.data);
            setSavedError("");
        } catch (err) {
            setSavedError(err.response?.data?.errorMessage || "Saved listings could not be loaded.");
        }
    }

    async function toggleSavedListing(apartment) {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            setSavedError("You must be logged in to save listings.");
            return;
        }

        try {
            if (savedListings.some(savedListing => savedListing.listingKey === apartment.id)) {
                await axios.delete("http://localhost:7000/api/delete/savedListing/" + apartment.id, {
                    params: {
                        userId,
                        listingKey: apartment.id
                    }
                });
            } else {
                await axios.post("http://localhost:7000/api/savedListing", {
                    userId,
                    listingKey: apartment.id,
                    listingName: apartment.name,
                    listingLocation: apartment.location,
                    listingRent: apartment.rent
                });
            }
            fetchSavedListings();
        } catch (err) {
            setSavedError(err.response?.data?.errorMessage || "Saved listing could not be updated.");
        }
    }

    const savedListingKeys = savedListings.map(savedListing => savedListing.listingKey);

    return (
        <section className="layoutSearch">
            <div className="sidebarSearch">
                <div className="search">
                    <h1>Apartment Search</h1>
                    <Link to="/Apartment">View apartment details</Link>
                </div>
                <input type="text" placeholder="Search" className="search" />
                <br />
                {apartments.map(apartment => (
                    <div className="apartmentListWrapper" key={apartment.id}>
                        <div className="apartmentListImage">
                            <img src={apartment.image} alt={apartment.name} />
                        </div>
                        <div className="apartmentList">
                            <h1>{apartment.name}</h1>
                            <p>{apartment.description}</p>
                            <p>{apartment.location}</p>
                            <p>{apartment.rent}</p>
                            <button onClick={() => toggleSavedListing(apartment)}>
                                {savedListingKeys.includes(apartment.id) ? "Unsave" : "Save"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bodySearch">
                <div className="filters">
                    <h2>Saved Listings</h2>
                    {savedError && <p>{savedError}</p>}
                    {savedListings.length === 0 ? (
                        <p>No saved listings yet.</p>
                    ) : (
                        savedListings.map(savedListing => (
                            <div key={savedListing._id}>
                                <h3>{savedListing.listingName}</h3>
                                <p>{savedListing.listingLocation}</p>
                                <p>{savedListing.listingRent}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    )

}

export default Search;
