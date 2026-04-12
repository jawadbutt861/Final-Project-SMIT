import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Plumbing', 'Electrician', 'Tutoring', 'AC Repair', 'Painting', 'Car Repair', 'Cleaning', 'IT Support', 'Other'];

export default function Services() {
  const [services, setServices] = useState([]);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: '', category: searchParams.get('category') || '', location: '', minPrice: '', maxPrice: ''
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await axios.get('/api/services', { params });
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Browse Services</h1>
            <p>Find skilled professionals near you</p>
          </div>
          {user?.role === 'provider' && (
            <Link to="/post-service" className="btn btn-primary">+ Post a Service</Link>
          )}
        </div>

        <div className="filters">
          <input placeholder="Search services..." value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })} />
          <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input placeholder="City/Area" value={filters.location}
            onChange={e => setFilters({ ...filters, location: e.target.value })} />
          <input type="number" placeholder="Min Price" value={filters.minPrice}
            onChange={e => setFilters({ ...filters, minPrice: e.target.value })} style={{ width: 110 }} />
          <input type="number" placeholder="Max Price" value={filters.maxPrice}
            onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} style={{ width: 110 }} />
          <button className="btn btn-primary btn-sm" onClick={fetchServices}>Search</button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>Loading services...</p>
        ) : services.length === 0 ? (
          <div className="empty"><p>No services found.</p></div>
        ) : (
          <div className="grid-3">
            {services.map(service => (
              <div key={service._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="badge badge-purple">{service.category}</span>
                  <span style={{ color: '#22c55e', fontWeight: 700 }}>Rs. {service.price.toLocaleString()}</span>
                </div>
                <h3 style={{ fontSize: '1rem' }}>{service.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {service.description}
                </p>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>📍 {service.location}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{service.provider?.name}</span>
                    <span style={{ color: '#94a3b8' }}> · {service.provider?.city}</span>
                  </div>
                  {user && user.id !== service.provider?._id && (
                    <Link to={`/chat/${service.provider?._id}`} className="btn btn-primary btn-sm">Contact</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
