import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { useSelector } from 'react-redux';

const ReviewForm = ({ 
  appointment, 
  doctor, 
  onSubmit, 
  onCancel, 
  initialData = null,
  isEditing = false 
}) => {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    categories: {
      communication: 0,
      treatment: 0,
      punctuality: 0,
      facilities: 0
    },
    isAnonymous: false
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        rating: initialData.rating || 0,
        title: initialData.title || '',
        comment: initialData.comment || '',
        categories: initialData.categories || {
          communication: 0,
          treatment: 0,
          punctuality: 0,
          facilities: 0
        },
        isAnonymous: initialData.isAnonymous || false
      });
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCategoryChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (formData.comment && formData.comment.length > 1000) {
      newErrors.comment = 'Comment must be less than 1000 characters';
    }

    if (formData.title && formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...formData,
      doctorId: doctor._id,
      appointmentId: appointment._id
    });
  };

  const renderStarRating = (rating, onRatingChange, hovered, onHover) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={() => onHover(0)}
            className="focus:outline-none"
          >
            <Star
              size={20}
              className={`${
                star <= (hovered || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const categoryLabels = {
    communication: 'Communication',
    treatment: 'Treatment Quality',
    punctuality: 'Punctuality',
    facilities: 'Facilities'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Review' : 'Write a Review'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Doctor Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Dr. {doctor.firstName} {doctor.lastName}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{doctor.specialization}</p>
            <p className="text-sm text-gray-500">
              Appointment on {new Date(appointment.scheduledDate).toLocaleDateString()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              <div className="flex items-center space-x-3">
                {renderStarRating(
                  formData.rating,
                  (rating) => handleInputChange('rating', rating),
                  hoveredRating,
                  setHoveredRating
                )}
                <span className="text-sm text-gray-600">
                  {formData.rating > 0 && `${formData.rating} out of 5`}
                </span>
              </div>
              {errors.rating && (
                <p className="text-red-600 text-sm mt-1">{errors.rating}</p>
              )}
            </div>

            {/* Category Ratings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rate Specific Aspects (Optional)
              </label>
              <div className="space-y-3">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{label}</span>
                    {renderStarRating(
                      formData.categories[key],
                      (rating) => handleCategoryChange(key, rating),
                      0,
                      () => {}
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title (Optional)
              </label>
              <input
                type="text"
                className="input"
                placeholder="Summarize your experience"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={100}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.title.length}/100
              </div>
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review (Optional)
              </label>
              <textarea
                className="input min-h-[100px] resize-none"
                placeholder="Share your experience with this doctor..."
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                maxLength={1000}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.comment.length}/1000
              </div>
              {errors.comment && (
                <p className="text-red-600 text-sm mt-1">{errors.comment}</p>
              )}
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.isAnonymous}
                onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700">
                Post anonymously
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
              >
                {isEditing ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
