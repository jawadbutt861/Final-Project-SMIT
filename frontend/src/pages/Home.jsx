import { Link } from 'react-router-dom';
import './Home.css';

const categories = [
  { icon: '🔧', name: 'Plumbing' },
  { icon: '⚡', name: 'Electrician' },
  { icon: '📚', name: 'Tutoring' },
  { icon: '❄️', name: 'AC Repair' },
  { icon: '🎨', name: 'Painting' },
  { icon: '🚗', name: 'Car Repair' },
  { icon: '🧹', name: 'Cleaning' },
  { icon: '💻', name: 'IT Support' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-badge">🇵🇰 Pakistan's Local Services Platform</div>
          <h1>Find Trusted <span>Local Services</span> Near You</h1>
          <p>Connect with skilled professionals in your city — plumbers, electricians, tutors, and more. Fast, reliable, local.</p>
          <div className="hero-btns">
            <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
            <Link to="/services" className="btn-outline">Find Services</Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-num">500+</div>
              <div className="stat-label">Service Providers</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">1200+</div>
              <div className="stat-label">Jobs Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">50+</div>
              <div className="stat-label">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Popular Categories</h2>
          <p className="section-sub">Browse services by category and find the right professional</p>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link key={cat.name} to={`/services?category=${cat.name}`} className="category-card">
                <span className="cat-icon">{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section bg-light">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">Get your work done in 4 simple steps</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">1</div>
              <h3>Post a Job</h3>
              <p>Describe what you need, set your budget and location in minutes.</p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <h3>Get Applicants</h3>
              <p>Skilled providers in your area will apply to your job quickly.</p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <h3>Chat & Hire</h3>
              <p>Chat with providers, compare, pick the best one and hire.</p>
            </div>
            <div className="step-card">
              <div className="step-num">4</div>
              <h3>Review</h3>
              <p>Leave a review after completion to help the community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container cta-content">
          <h2>Are you a service provider?</h2>
          <p>Create your profile, post your gigs, and start earning today.</p>
          <Link to="/register" className="btn btn-primary">Join as Provider →</Link>
        </div>
      </section>
    </div>
  );
}
