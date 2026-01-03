import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ContactCard from './components/ContactCard';
import { UserPlus, Users, Search, Sparkles } from 'lucide-react';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { countryOptions } from './data/countries';
import './App.css';

const API_URL = 'http://localhost:5000/api/contacts';

function App() {
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [countryCode, setCountryCode] = useState('+91');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(API_URL);
      setContacts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const validate = () => {
    let tempErrors = {};

    if (!formData.name.trim()) {
      tempErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      tempErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!formData.email) {
      tempErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone) {
      tempErrors.phone = "Phone is required";
    } else {
      const fullNumber = `${countryCode}${formData.phone}`;
      const selectedCountry = countryOptions.find(c => c.dial_code === countryCode);
      const regionCode = selectedCountry ? selectedCountry.code : undefined;

      if (!isValidPhoneNumber(formData.phone, regionCode)) {
        tempErrors.phone = `Invalid phone number for ${selectedCountry ? selectedCountry.name : 'selected country'}`;
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const submissionData = {
        ...formData,
        phone: `${countryCode} ${formData.phone}`
      };

      const res = await axios.post(API_URL, submissionData);
      setContacts([res.data, ...contacts]);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setStatus({ type: 'success', msg: 'Contact added successfully!' });
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to save contact.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setContacts(contacts.filter(contact => contact._id !== id));
      setStatus({ type: 'success', msg: 'Contact deleted.' });
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-content">
          <div className="brand">
            <Sparkles size={24} />
            <h1>ContactManager</h1>
          </div>
          <div className="contact-count">
            <Users size={16} />
            <span>{contacts.length} Contacts</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        {status.msg && (
          <div className={`status-message ${status.type === 'success' ? 'status-success' : 'status-error'}`}>
            <span>{status.msg}</span>
            <button onClick={() => setStatus({ type: '', msg: '' })} className="close-btn">X</button>
          </div>
        )}

        <div className="layout-grid">
          <div className="form-card">
            <div className="form-header">
              <h2><UserPlus size={20} /> New Contact</h2>
              <p className="form-subtitle">Add a new person to your network</p>
            </div>

            <div className="form-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                  />
                  {errors.name && <p className="error-text">{errors.name}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                  />
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="phone-input-group">
                    <select
                      className="country-select"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      {countryOptions.map(country => (
                        <option key={country.code} value={country.dial_code}>
                          {country.code} {country.dial_code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="1234567890"
                      className={`form-input phone-field ${errors.phone ? 'error' : ''}`}
                    />
                  </div>
                  {errors.phone && <p className="error-text">{errors.phone}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Message (Optional)</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Add a note..."
                    className="form-textarea"
                    rows="3"
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">Save Contact</button>
              </form>
            </div>
          </div>

          <div className="list-section">
            <div className="controls-bar">
              <div className="search-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="sort-wrapper">
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Sort by:</span>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>

            <div className="contacts-grid">
              {sortedContacts.length === 0 ? (
                <div className="no-contacts">
                  <div className="empty-icon">
                    <Users size={32} />
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem', color: '#111827' }}>No contacts found</h3>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                    {searchTerm ? "Try adjusting your search terms." : "Get started by adding your first contact using the form."}
                  </p>
                </div>
              ) : (
                sortedContacts.map(contact => (
                  <ContactCard
                    key={contact._id}
                    contact={contact}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;