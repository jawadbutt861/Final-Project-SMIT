import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [showReview, setShowReview] = useState(false);

  const fetchJob = async () => {
    try {
      const { data } = await axios.get(`/api/jobs/${id}`);
      setJob(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJob(); }, [id]);

  const handleApply = async () => {
    try {
      await axios.post(`/api/jobs/${id}/apply`);
      setMsg('Applied successfully!');
      fetchJob();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error applying');
    }
  };

  const handleHire = async (providerId) => {
    try {
      await axios.post(`/api/jobs/${id}/hire/${providerId}`);
      setMsg('Provider hired!');
      fetchJob();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error hiring');
    }
  };

  const handleComplete = async () => {
    try {
      await axios.post(`/api/jobs/${id}/complete`);
      setMsg('Job marked as complete!');
      fetchJob();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/reviews', {
        job: id,
        provider: job.hiredProvider._id,
        rating: review.rating,
        comment: review.comment
      });
      setMsg('Review submitted!');
      setShowReview(false);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error submitting review');
    }
  };

  if (loading) return <div className="page"><div className="container"><p>Loading...</p></div></div>;
  if (!job) return <div className="page"><div className="container"><p>Job not found.</p></div></div>;

  const isOwner = user?.id === job.postedBy?._id;
  const hasApplied = job.applicants?.some(a => a._id === user?.id);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        {msg && <div className={`alert ${msg.includes('Error') || msg.includes('Already') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <span className={`badge ${job.status === 'open' ? 'badge-green' : job.status === 'in-progress' ? 'badge-yellow' : 'badge-blue'}`}>
              {job.status}
            </span>
            <span className="badge badge-purple">{job.category}</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.8rem' }}>{job.title}</h1>
          <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1.5rem' }}>{job.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ background: '#f8fafc', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Budget</div>
              <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '1.2rem' }}>Rs. {job.budget.toLocaleString()}</div>
            </div>
            <div className="card" style={{ background: '#f8fafc', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Location</div>
              <div style={{ fontWeight: 600 }}>📍 {job.location}</div>
            </div>
            <div className="card" style={{ background: '#f8fafc', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Posted By</div>
              <div style={{ fontWeight: 600 }}>{job.postedBy?.name}</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            {user?.role === 'provider' && job.status === 'open' && !hasApplied && (
              <button className="btn btn-primary" onClick={handleApply}>Apply for this Job</button>
            )}
            {user?.role === 'provider' && hasApplied && (
              <span className="badge badge-green" style={{ padding: '0.5rem 1rem' }}>✓ Applied</span>
            )}
            {isOwner && job.status === 'in-progress' && (
              <button className="btn btn-success" onClick={handleComplete}>Mark as Complete</button>
            )}
            {isOwner && job.status === 'completed' && !showReview && (
              <button className="btn btn-primary" onClick={() => setShowReview(true)}>Leave Review</button>
            )}
            {user && !isOwner && job.postedBy && (
              <Link to={`/chat/${job.postedBy._id}`} className="btn btn-secondary">💬 Chat with Customer</Link>
            )}
          </div>
        </div>

        {/* Review Form */}
        {showReview && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Leave a Review</h3>
            <form onSubmit={handleReview}>
              <div className="form-group">
                <label>Rating</label>
                <select value={review.rating} onChange={e => setReview({ ...review, rating: Number(e.target.value) })}>
                  {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{'⭐'.repeat(r)} ({r}/5)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea rows={3} value={review.comment} onChange={e => setReview({ ...review, comment: e.target.value })} required />
              </div>
              <button className="btn btn-primary">Submit Review</button>
            </form>
          </div>
        )}

        {/* Applicants */}
        {isOwner && job.applicants?.length > 0 && (
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Applicants ({job.applicants.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {job.applicants.map(applicant => (
                <div key={applicant._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: '#f8fafc', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{applicant.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>📍 {applicant.city}</div>
                    {applicant.bio && <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>{applicant.bio}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/chat/${applicant._id}`} className="btn btn-secondary btn-sm">💬 Chat</Link>
                    {job.status === 'open' && (
                      <button className="btn btn-success btn-sm" onClick={() => handleHire(applicant._id)}>Hire</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
