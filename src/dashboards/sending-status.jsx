// SendingEmails.jsx
import React, { useState } from "react";
import { BASE_URL } from "../config";

function SendingEmails() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [users, setUsers] = useState([{ name: "", email: "", is_valid: true }]);
  const [status, setStatus] = useState(null);

  const token = sessionStorage.getItem("token"); // get JWT

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const handleUserChange = (index, field, value) => {
    const newUsers = [...users];
    newUsers[index][field] = value;
    setUsers(newUsers);
  };

  const addUser = () => setUsers([...users, { name: "", email: "", is_valid: true }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/generate/send-emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({ subject, body, users }),
      });

      if (res.status === 401) {
        alert("Unauthorized! Please login again.");
        return;
      }

      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Send emails error:", err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="sending-emails">
      <h2>Send Bulk Emails</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Body:</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>

        <h3>Recipients</h3>
        {users.map((user, i) => (
          <div key={i}>
            <input
              type="text"
              placeholder="Name"
              value={user.name}
              onChange={(e) => handleUserChange(i, "name", e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={user.email}
              onChange={(e) => handleUserChange(i, "email", e.target.value)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addUser}>Add Recipient</button>
        <br />
        <button type="submit">Send Emails</button>
      </form>

      {status && (
        <div className="status">
          <h4>Campaign Status:</h4>
          <p>Campaign ID: {status.campaign_id}</p>
          <p>Subject: {status.subject}</p>
          <p>Total Recipients: {status.total}</p>
          <p>Sent: {status.sent}</p>
          <p>Failed: {status.failed}</p>
          <p>Status: {status.status}</p>
        </div>
      )}
    </div>
  );
}

export default SendingEmails;
