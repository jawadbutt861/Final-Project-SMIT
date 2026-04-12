import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [services, setServices] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'customer') {
          const { data } = await axios.get('/api/jobs/user/mine');
          setJobs(data);
        } else {
          const [svcRes, jobsRes] = await Promise.all([
            axios.get('/api/services/user/mine'),
            axios.get('/api/jobs')
          ]);
          setServices(svcRes.data);
          // Filter jobs where user has applied
          const applied = jobsRes.data.filter(j => j.applicants?.includes(user.id));
          setAppliedJobs(applied);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const deleteService = async (id) => {
    try {
      await axios.delete(`/api/services/${id}`);
      setServices(services.filter(s => s._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="page"><div className="container"><p>Loading...</p></div></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {user.name} · <span className="badge badge-purple">{user.role}</span></p>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            {user.role === 'customer' && <Link to="/post-job" className="btn btn-primary">+ Post Job</Link>}
            {user.role === 'provider' && <Link to="/post-service" className="btn btn-primary">+ Post Service</Link>}
            <Link to="/chat" className="btn btn-secondary">💬 Messages</Link>
          </div>
        </div>

        {/* Customer Dashboard */}
        {user.role === 'customer' && (
          <div>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>My Posted Jobs ({jobs.length})</h2>
            {jobs.length === 0 ? (
              <div className="empty card">
                <p>No jobs posted yet.</p>
                <Link to="/post-job" className="btn btn-primary" style={{ marginTop: '1rem' }}>Post Your First Job</Link>
              </div>
            ) : (
              <div className="grid-3">
                {jobs.map(job => (
                  <Link to={`/jobs/${job._id}`} key={job._id} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className={`badge ${job.status === 'open' ? 'badge-green' : job.status === 'in-progress' ? 'badge-yellow' : 'badge-blue'}`}>
                          {job.status}
                        </span>
                        <span className="badge badge-purple">{job.category}</span>
                      </div>
                      <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{job.title}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: '#22c55e', fontWeight: 600 }}>Rs. {job.budget.toLocaleString()}</span>
                        <span style={{ color: '#64748b' }}>{job.applicants?.length || 0} applicants</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Provider Dashboard */}
        {user.role === 'provider' && (
          <div>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>My Services ({services.length})</h2>
            {services.length === 0 ? (
              <div className="empty card" style={{ marginBottom: '2rem' }}>
                <p>No services posted yet.</p>
                <Link to="/post-service" className="btn btn-primary" style={{ marginTop: '1rem' }}>Post Your First Service</Link>
              </div>
            ) : (
              <div className="grid-3" style={{ marginBottom: '2rem' }}>
                {services.map(service => (
                  <div key={service._id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge badge-purple">{service.category}</span>
                      <span style={{ color: '#22c55e', fontWeight: 700 }}>Rs. {service.price.toLocaleString()}</span>
                    </div>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{service.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.8rem' }}>📍 {service.location}</p>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteService(service._id)}>Delete</button>
                  </div>
                ))}
              </div>
            )}

            <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Browse Open Jobs</h2>
            <Link to="/jobs" className="btn btn-secondary" style={{ marginBottom: '1rem', display: 'inline-block' }}>
              View All Jobs →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
