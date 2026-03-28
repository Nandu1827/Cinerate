import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../api/api';
import { useNavigate } from 'react-router-dom';

const ContactUs = ({ isSignedIn }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting contact form:', formData);
      const response = await axios.post(`${API_URL}/notifications/contact`, formData);
      console.log('Contact form response:', response.data);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setError('');
      
      // Show success message for 3 seconds then redirect
      setTimeout(() => {
        setIsSubmitted(false);
        if (isSignedIn) {
          navigate('/profile');
        } else {
          navigate('/');
        }
      }, 3000);
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="contact-page">
      <header className="cine-page-header">
        <h1 className="cine-page-title">Contact</h1>
        <p className="cine-page-subtitle">We&apos;d love to hear from you — questions, ideas, or feedback.</p>
      </header>
      <div className="contact-container">
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <p>Reach out with any questions or feedback about CineRate.</p>
          <ul className="contact-details">
            <li>
              <i className="fas fa-envelope contact-detail-icon" aria-hidden="true" />
              <strong>Email:</strong>{' '}
              <a href="mailto:support@cinerate.app">support@cinerate.app</a>
            </li>
            <li>
              <i className="fas fa-phone contact-detail-icon" aria-hidden="true" />
              <strong>Phone:</strong>{' '}
              <a href="tel:+1234567890">+1 (234) 567-890</a>
            </li>
            <li>
              <i className="fas fa-map-marker-alt contact-detail-icon" aria-hidden="true" />
              <strong>Address:</strong> 123 Movie Lane, Cinema City, CA 90210
            </li>
          </ul>
          <div className="social-links">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a
                href="https://facebook.com"
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://twitter.com"
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <i className="fab fa-x-twitter"></i>
              </a>
              <a
                href="https://instagram.com"
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="contact-form">
          <h2>Send Us a Message</h2>
          {isSubmitted && (
            <div className="success-message">
              Thank you for your message! We'll get back to you soon.
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                required
              />
            </div>
            <button type="submit" className="auth-button">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;