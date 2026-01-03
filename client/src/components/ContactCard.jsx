import React from 'react';
import { Trash2, Phone, Mail, MessageSquare } from 'lucide-react';


const ContactCard = ({ contact, onDelete }) => {
    return (
        <div className="contact-card">
            <div className="card-padding">
                <div className="card-header">
                    <div className="user-info">
                        <div className="avatar">
                            {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <h3>{contact.name}</h3>
                            <p>Added {new Date(contact.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onDelete(contact._id)}
                        className="delete-btn"
                        title="Delete Contact"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                <div className="card-body">
                    <div className="info-row">
                        <div className="icon-wrapper">
                            <Mail size={16} color="#4f46e5" />
                        </div>
                        <span>{contact.email}</span>
                    </div>

                    <div className="info-row">
                        <div className="icon-wrapper">
                            <Phone size={16} color="#10b981" />
                        </div>
                        <span>{contact.phone}</span>
                    </div>

                    {contact.message && (
                        <div className="message-box">
                            <div className="icon-wrapper">
                                <MessageSquare size={16} color="#8b5cf6" />
                            </div>
                            <p className="message-text">"{contact.message}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactCard;