import { Link } from "react-router-dom";
import React from "react";

function Apartment(){

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
                    <button>Message</button>
                    <button>Apply</button>
                </div>
                </div>
            </div>
            <div className="bodyApartment">
               <div className="apartmentPage2">
                    <h1>Information</h1>
                    <p>Two bedroom apartment near campus with shared kitchen, living room, and laundry access.</p>
                    <h2>Current Tenants</h2>
                    <div className="tenantCard">
                        <h3>Maya Chen</h3>
                        <p><strong>Role:</strong> Current tenant</p>
                        <p><strong>Lifestyle:</strong> Quiet, clean, studies at home during the week.</p>
                        <p><strong>Looking for:</strong> A roommate who respects shared spaces and communicates clearly.</p>
                        <Link to="/TenantProfile">View Tenant Profile</Link>
                    </div>
                </div>
            </div>
        </section></>
    )

}

export default Apartment;
