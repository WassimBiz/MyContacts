import { useEffect, useState } from "react";
import "./Contacts.css";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const token = localStorage.getItem("token");

  const fetchContacts = async () => {
    const res = await fetch("http://localhost:4000/contacts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setContacts(Array.isArray(data.items) ? data.items : []);
    }
  };

  useEffect(() => {
    if (token) fetchContacts();
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:4000/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ firstName, lastName, phone }),
    });
    if (res.ok) {
      await fetchContacts();
      setFirstName("");
      setLastName("");
      setPhone("");
    } else {
      alert("Création impossible (vérifie les champs et le token).");
    }
  };

  return (
    <div className="contacts-container">
      <h2>Contacts</h2>

      <form className="contacts-form" onSubmit={handleAdd}>
        <input
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          placeholder="Phone (10–20)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          minLength={10}
          maxLength={20}
          required
        />
        <button type="submit">Add Contact</button>
      </form>

      <table className="contacts-table">
        <thead>
          <tr>
            <th>Prénom</th>
            <th>Nom</th>
            <th>Téléphone</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 ? (
            <tr>
              <td colSpan="3">Aucun contact pour le moment.</td>
            </tr>
          ) : (
            contacts.map((c) => (
              <tr key={c.id || c._id}>
                <td>{c.firstName}</td>
                <td>{c.lastName}</td>
                <td>{c.phone}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
