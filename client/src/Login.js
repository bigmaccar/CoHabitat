import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import axios from 'axios';

const SUPPORT_EMAIL = "support@gmail.com";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin(e) {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:7000/api/login", { email, password });
            const user = res.data.user;
            localStorage.setItem("userId", user._id);
            localStorage.setItem("userName", `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email);
            localStorage.setItem("userEmail", user.email);
            localStorage.removeItem("householdId");
            if (user.households && user.households.length > 0) {
                localStorage.setItem("householdId", user.households[0].householdId);
            }
            navigate(user.email.toLowerCase() === SUPPORT_EMAIL ? "/Tickets" : "/");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed.");
        }
    }

    return (
        <form onSubmit={handleLogin}>
            <center>
                <div className="login">
                    <h2>Login</h2>
                    <label htmlFor="email">Email: </label>
                    <input type="text" placeholder="Enter email." id="email" value={email} onChange={e => setEmail(e.target.value)} />
                    <br />
                    <label htmlFor="password">Password: </label>
                    <input type="password" placeholder="Enter password." id="password" value={password} onChange={e => setPassword(e.target.value)} />
                    <br /><br />
                    {error && <p style={{color: "red"}}>{error}</p>}
                    <input type="submit" value="Login" />
                    <p>Don't have an account? <Link to="/Signup">Sign up here.</Link></p>
                </div>
            </center>
        </form>
    );
}

export default Login;
