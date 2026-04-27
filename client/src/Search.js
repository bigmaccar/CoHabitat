import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";

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

    useEffect(() => {
        const storedListings = JSON.parse(localStorage.getItem("savedListings") || "[]");
        setSavedListings(storedListings);
    }, []);

    function toggleSavedListing(apartmentId) {
        const updatedListings = savedListings.includes(apartmentId)
            ? savedListings.filter(id => id !== apartmentId)
            : [...savedListings, apartmentId];

        setSavedListings(updatedListings);
        localStorage.setItem("savedListings", JSON.stringify(updatedListings));
    }

    const savedApartmentDetails = apartments.filter(apartment => savedListings.includes(apartment.id));

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
                            <button onClick={() => toggleSavedListing(apartment.id)}>
                                {savedListings.includes(apartment.id) ? "Unsave" : "Save"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bodySearch">
                <div className="filters">
                    <h2>Saved Listings</h2>
                    {savedApartmentDetails.length === 0 ? (
                        <p>No saved listings yet.</p>
                    ) : (
                        savedApartmentDetails.map(apartment => (
                            <div key={apartment.id}>
                                <h3>{apartment.name}</h3>
                                <p>{apartment.location}</p>
                                <p>{apartment.rent}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    )

}

export default Search;
