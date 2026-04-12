import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Plumbing', 'Electrician', 'Tutoring', 'AC Repair', 'Painting', 'Car Repair', 'Cleaning', 'IT Support', 'Other'];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', location: '', minBudget: '', maxBudget: '' });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await axios.get('/api/jobs', { params });
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Browse Jobs</h1>
            <p>Find work opportunities near you</p>
          </div>
          {user?.role === 'customer' && (
            <Link to="/post-job" className="btn btn-primary">+ Post a Job</Link>
          )}
        </div>

        <div className="filters">
          <input placeholder="Search jobs..." value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })} />
          <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input placeholder="City/Area" value={filters.location}
            onChange={e => setFilters({ ...filters, location: e.target.value })} />
          <input type="number" placeholder="Min Budget" value={filters.minBudget}
            onChange={e => setFilters({ ...filters, minBudget: e.target.value })} style={{ width: 120 }} />
          <input type="number" placeholder="Max Budget" value={filters.maxBudget}
            onChange={e => setFilters({ ...filters, maxBudget: e.target.value })} style={{ width: 120 }} />
          <button className="btn btn-primary btn-sm" onClick={fetchJobs}>Search</button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="empty"><p>No jobs found. Try different filters.</p></div>
        ) : (
          <div className="grid-3">
            {jobs.map(job => (
              <Link to={`/jobs/${job._id}`} key={job._id} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                    <span className={`badge ${job.status === 'open' ? 'badge-green' : job.status === 'in-progress' ? 'badge-yellow' : 'badge-blue'}`}>
                      {job.status === 'open' ? '🟢 Open' : job.status === 'in-progress' ? '🟡 In Progress' : '✅ Done'}
                    </span>
                    <span className="badge badge-purple">{job.category}</span>
                  </div>
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>{job.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>
                    {job.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '1rem' }}>Rs. {job.budget.toLocaleString()}</span>
                    <span style={{ color: '#64748b' }}>📍 {job.location}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', paddingTop: '0.8rem', borderTop: '1px solid #f1f5f9' }}>
                    <span>👤 {job.postedBy?.name}</span>
                    <span>👥 {job.applicants?.length || 0} applicants</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
