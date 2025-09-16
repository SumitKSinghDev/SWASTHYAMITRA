import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Star, Plus, Filter, Search } from 'lucide-react';
import ReviewCard from '../../components/Reviews/ReviewCard';
import ReviewForm from '../../components/Reviews/ReviewForm';

const PatientReviews = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchReviews();
    fetchAppointments();
  }, [page, filter, searchTerm]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/reviews/my-reviews`, {
        headers: { Authorization: `Bearer ${user.token}` },
        params: { page, limit: 10 }
      });
      setReviews(data?.data?.reviews || []);
      setTotalPages(data?.data?.pagination?.totalPages || 1);
    } catch (error) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/patients/appointments`, {
        headers: { Authorization: `Bearer ${user.token}` },
        params: { status: 'completed', limit: 50 }
      });
      setAppointments(data?.data?.appointments || []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const handleCreateReview = (appointment) => {
    setSelectedAppointment(appointment);
    setEditingReview(null);
    setShowReviewForm(true);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setSelectedAppointment({
      _id: review.appointment._id,
      scheduledDate: review.appointment.scheduledDate,
      doctor: {
        _id: review.doctor._id,
        firstName: review.doctor.firstName,
        lastName: review.doctor.lastName,
        specialization: review.doctor.specialization
      }
    });
    setShowReviewForm(true);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      setLoading(true);
      
      if (editingReview) {
        // Update existing review
        await axios.put(`${API_BASE}/reviews/${editingReview._id}`, reviewData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } else {
        // Create new review
        await axios.post(`${API_BASE}/reviews`, reviewData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }

      setShowReviewForm(false);
      setSelectedAppointment(null);
      setEditingReview(null);
      fetchReviews();
    } catch (error) {
      setError('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (review) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/reviews/${review._id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchReviews();
    } catch (error) {
      setError('Failed to delete review');
    }
  };

  const handleVoteHelpful = async (reviewId) => {
    try {
      await axios.post(`${API_BASE}/reviews/${reviewId}/helpful`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchReviews();
    } catch (error) {
      console.error('Failed to vote helpful:', error);
    }
  };

  const handleReportReview = async (reviewId) => {
    const reason = prompt('Please provide a reason for reporting this review:');
    if (!reason) return;

    try {
      await axios.post(`${API_BASE}/reviews/${reviewId}/report`, 
        { reason }, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert('Review reported successfully');
    } catch (error) {
      setError('Failed to report review');
    }
  };

  const getAppointmentsWithoutReviews = () => {
    const reviewedAppointmentIds = reviews.map(review => review.appointment._id);
    return appointments.filter(appointment => 
      !reviewedAppointmentIds.includes(appointment._id)
    );
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'high') return review.rating >= 4;
    if (filter === 'medium') return review.rating === 3;
    if (filter === 'low') return review.rating <= 2;
    return true;
  });

  const searchFilteredReviews = filteredReviews.filter(review => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      review.doctor.firstName.toLowerCase().includes(searchLower) ||
      review.doctor.lastName.toLowerCase().includes(searchLower) ||
      review.doctor.specialization.toLowerCase().includes(searchLower) ||
      (review.title && review.title.toLowerCase().includes(searchLower)) ||
      (review.comment && review.comment.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600">Manage your reviews and feedback</p>
        </div>
        <button
          onClick={() => setShowReviewForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Write Review</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Reviews</option>
              <option value="high">High Rating (4-5 stars)</option>
              <option value="medium">Medium Rating (3 stars)</option>
              <option value="low">Low Rating (1-2 stars)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pending Reviews */}
      {getAppointmentsWithoutReviews().length > 0 && (
        <div className="card">
          <div className="card-content">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Reviews
            </h3>
            <div className="space-y-3">
              {getAppointmentsWithoutReviews().slice(0, 3).map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {appointment.specialization} • {new Date(appointment.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCreateReview(appointment)}
                    className="btn btn-outline btn-sm"
                  >
                    Write Review
                  </button>
                </div>
              ))}
              {getAppointmentsWithoutReviews().length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{getAppointmentsWithoutReviews().length - 3} more appointments pending review
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : searchFilteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <Star size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No reviews found</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm ? 'Try adjusting your search terms' : 'Write your first review after completing an appointment'}
            </p>
          </div>
        ) : (
          searchFilteredReviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              onVoteHelpful={handleVoteHelpful}
              onReport={handleReportReview}
              showActions={true}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {searchFilteredReviews.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            className="btn btn-outline btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-outline btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          appointment={selectedAppointment}
          doctor={selectedAppointment?.doctor}
          onSubmit={handleSubmitReview}
          onCancel={() => {
            setShowReviewForm(false);
            setSelectedAppointment(null);
            setEditingReview(null);
          }}
          initialData={editingReview}
          isEditing={!!editingReview}
        />
      )}
    </div>
  );
};

export default PatientReviews;
