import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import "./Contacts.css";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const fetchContacts = async () => {
    const res = await apiFetch("/contacts");
    if (res.ok) {
      const data = await res.json();
      setContacts(data.items || []);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await apiFetch("/contacts", {
      method: "POST",
      body: JSON.stringify({ firstName, lastName, phone }),
    });
    if (res.ok) {
      setFirstName(""); setLastName(""); setPhone("");
      fetchContacts();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.error?.message || "Create failed");
    }
  };

  return (
    <div className="contacts-container">
      <form className="contacts-form" onSubmit={handleAdd}>
        <input placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button type="submit">Add Contact</button>
      </form>

      <table className="contacts-table">
        <thead>
          <tr><th>Prénom</th><th>Nom</th><th>Téléphone</th></tr>
        </thead>
        <tbody>
          {contacts.map(c => (
            <tr key={c.id || c._id}>
              <td>{c.firstName}</td>
              <td>{c.lastName}</td>
              <td>{c.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
