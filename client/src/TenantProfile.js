import { Link } from "react-router-dom";
import React from "react";

function TenantProfile(){

    return (
        <section className="layoutApartment">
            <div className="sidebarApartment">
                <div className="apartmentPage">
                    <Link to="/Apartment">Back to Apartment</Link>
                    <h1>Maya Chen</h1>
                    <img src={require("./images/person.png")} className="tenantProfileImage" alt="Tenant profile"/>
                </div>
            </div>
            <div className="bodyApartment">
                <div className="apartmentPage2">
                    <h1>Tenant Profile</h1>
                    <p><strong>Current Apartment:</strong> Apartment 1</p>
                    <p><strong>About:</strong> Graduate student who prefers a calm apartment during the week.</p>
                    <p><strong>Lifestyle Preferences:</strong> Quiet evenings, clean shared spaces, no smoking, okay with pets.</p>
                    <p><strong>Roommate Preferences:</strong> Someone respectful, communicative, and consistent with chores.</p>
                    <p><strong>Typical Schedule:</strong> Classes during the day and studying at home most weeknights.</p>
                </div>
            </div>
        </section>
    )

}

export default TenantProfile;
