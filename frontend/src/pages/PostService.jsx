import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CATEGORIES = ['Plumbing', 'Electrician', 'Tutoring', 'AC Repair', 'Painting', 'Car Repair', 'Cleaning', 'IT Support', 'Other'];

export default function PostService() {
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', location: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/services', form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600 }}>
        <div className="page-header">
          <h1>Post a Service</h1>
          <p>Let customers find your skills</p>
        </div>
        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Service Title</label>
              <input placeholder='e.g. "Fix AC in 2 hours"' value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={4} placeholder="Describe your service, experience, tools used..." value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Price (Rs.)</label>
              <input type="number" placeholder="e.g. 1500" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} required min={1} />
            </div>
            <div className="form-group">
              <label>Location (City/Area)</label>
              <input placeholder="e.g. Lahore, DHA" value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })} required />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Posting...' : 'Post Service'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
