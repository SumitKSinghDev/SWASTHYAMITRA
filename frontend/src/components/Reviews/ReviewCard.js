import React, { useState } from 'react';
import { Star, ThumbsUp, Flag, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';

const ReviewCard = ({ 
  review, 
  onEdit, 
  onDelete, 
  onVoteHelpful, 
  onReport,
  showActions = false 
}) => {
  const { user } = useSelector((state) => state.auth);
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderCategoryRating = (label, rating) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <div className="flex items-center space-x-1">
          <span className="text-gray-900 font-medium">{rating}</span>
          <Star size={14} className="text-yellow-400 fill-current" />
        </div>
      </div>
    );
  };

  const isOwnReview = user && review.patient._id === user._id;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-semibold text-sm">
              {review.isAnonymous ? 'A' : review.patient.firstName?.charAt(0)}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              {review.isAnonymous ? 'Anonymous' : `${review.patient.firstName} ${review.patient.lastName}`}
            </h4>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(review.rating)}
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        {showActions && isOwnReview && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <MoreVertical size={16} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onEdit(review);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(review);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {review.title && (
        <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
      )}

      {review.comment && (
        <p className="text-gray-700 mb-3">{review.comment}</p>
      )}

      {/* Category Ratings */}
      {review.categories && (
        <div className="space-y-1 mb-3 p-3 bg-gray-50 rounded-lg">
          {renderCategoryRating('Communication', review.categories.communication)}
          {renderCategoryRating('Treatment', review.categories.treatment)}
          {renderCategoryRating('Punctuality', review.categories.punctuality)}
          {renderCategoryRating('Facilities', review.categories.facilities)}
        </div>
      )}

      {/* Doctor Response */}
      {review.response && (
        <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-blue-900">Doctor's Response</span>
            <span className="text-xs text-blue-600">
              {formatDate(review.response.respondedAt)}
            </span>
          </div>
          <p className="text-sm text-blue-800">{review.response.text}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onVoteHelpful(review._id)}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <ThumbsUp size={14} />
            <span>Helpful ({review.helpfulVotes || 0})</span>
          </button>
          
          {!isOwnReview && (
            <button
              onClick={() => onReport(review._id)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600"
            >
              <Flag size={14} />
              <span>Report</span>
            </button>
          )}
        </div>

        {review.appointment && (
          <div className="text-xs text-gray-500">
            {review.appointment.consultationType} • {formatDate(review.appointment.scheduledDate)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
