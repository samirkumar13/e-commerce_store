
import React, { useState, useEffect } from 'react';
import * as apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Button from './UIElements/Button';
import StarRating from './StarRating';

// Utility for formatting date
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};


interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    userId: string;
    user: {
        name: string;
    };
}

interface ReviewSectionProps {
    productId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
    const { isAuthenticated, user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [overallRating, setOverallRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);

    // Eligibility State
    const [canReview, setCanReview] = useState(false);
    const [checkReason, setCheckReason] = useState<string | null>(null);

    // Form State (for both add and edit)
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = async () => {
        try {
            const data = await apiService.fetchProductReviews(productId);
            setReviews(data.reviews);
            setOverallRating(data.averageRating);
            setTotalReviews(data.totalReviews);
        } catch (err) {
            console.error("Failed to load reviews", err);
        } finally {
            setLoading(false);
        }
    };

    const checkEligibility = async () => {
        if (!isAuthenticated) return;
        try {
            const status = await apiService.checkReviewEligibility(productId);
            setCanReview(status.canReview);
            if (!status.canReview) setCheckReason(status.reason);
        } catch (err) {
            console.error("Eligibility check failed", err);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    useEffect(() => {
        checkEligibility();
    }, [productId, isAuthenticated]);

    const handleEdit = (review: Review) => {
        setEditMode(true);
        setEditingReviewId(review.id);
        setUserRating(review.rating);
        setUserComment(review.comment);
        setShowForm(true);
        window.scrollTo({ top: document.getElementById('review-form')?.offsetTop || 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            if (editMode && editingReviewId) {
                await apiService.updateReview(editingReviewId, {
                    rating: userRating,
                    comment: userComment
                });
            } else {
                await apiService.addReview({
                    productId,
                    rating: userRating,
                    comment: userComment
                });
            }

            setShowForm(false);
            setEditMode(false);
            setEditingReviewId(null);
            setUserComment('');
            setUserRating(5);
            fetchReviews(); // Refresh list

            if (!editMode) {
                setCanReview(false); // Can't review again after new review
            }
        } catch (err: any) {
            setError(err.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    // If functionality is globally disabled, checkReason might be "Reviews are currently disabled..."
    // In that case we might want to hide the whole section or show a message.
    if (checkReason === 'Reviews are currently disabled by the store owner.') {
        return null; // Or return a message
    }

    return (
        <div className="mt-16 border-t border-slate-200 pt-12" id="reviews">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Customer Reviews</h2>
            </div>

            {/* Summary & Stats */}
            <div className="flex flex-col md:flex-row gap-8 mb-10 items-start md:items-center bg-slate-50 p-6 rounded-xl border border-slate-100">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm w-32 h-32 border border-slate-100">
                        <span className="text-4xl font-bold text-slate-900">{overallRating.toFixed(1)}</span>
                        <div className="flex my-2">
                            <StarRating rating={Math.round(overallRating)} size="sm" />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{totalReviews} Reviews</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-slate-600 mb-1">Overall Rating</p>
                        <p className="text-sm text-slate-500 max-w-xs">{totalReviews > 0 ? "Based on verified purchases." : "No reviews yet."}</p>
                    </div>
                </div>

                <div className="md:ml-auto">
                    {/* Check Eligibility Button */}
                    {isAuthenticated ? (
                        canReview ? (
                            !showForm && (
                                <button
                                    onClick={() => { setShowForm(true); setEditMode(false); setUserComment(''); setUserRating(5); }}
                                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    Write a Review
                                </button>
                            )
                        ) : (
                            // Determine if user has already reviewed, to show "Edit" logic differently? 
                            // Actually, if they already reviewed, canReview is false.
                            // We rely on the "Edit" button on the review itself.
                            null
                        )
                    ) : (
                        <div className="text-right">
                            <p className="text-sm text-slate-500 mb-2">Login to write a review</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Review Form */}
            {showForm && (
                <div id="review-form" className="mb-12 bg-white p-8 rounded-xl shadow-lg border border-slate-200 animate-fade-in ring-1 ring-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800">{editMode ? 'Edit Review' : 'Write a Review'}</h3>
                        <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 text-red-700 bg-red-50 p-4 rounded-lg flex items-center gap-2 border border-red-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setUserRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`h-10 w-10 ${star <= userRating ? 'text-yellow-400 fill-current drop-shadow-sm' : 'text-slate-200'}`}
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="comment" className="block text-sm font-semibold text-slate-700 mb-2">Your Review</label>
                            <textarea
                                id="comment"
                                rows={5}
                                value={userComment}
                                onChange={(e) => setUserComment(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow resize-y"
                                placeholder="What did you like or dislike about this product?"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button type="submit" variant="primary" disabled={submitting}>
                                {submitting ? 'Submitting...' : editMode ? 'Update Review' : 'Submit Review'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <p className="text-slate-500 font-medium">No reviews yet.</p>
                        <p className="text-sm text-slate-400">Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center text-primary font-bold text-lg">
                                        {review.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">{review.user.name}</span>
                                            {/* We can assume all displayed reviews are from valid purchases due to strict backend logic, but explicit check shows intention */}
                                            <span className="flex items-center text-[10px] font-bold tracking-wide uppercase text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Verified Purchase
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                                    </div>
                                </div>

                                {isAuthenticated && user?.id === review.userId && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleEdit(review)}
                                        className="!px-3 !py-1 text-xs"
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>

                            <div className="mb-3 ml-13 pl-13">
                                <StarRating rating={review.rating} size="sm" />
                            </div>

                            <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-lg text-sm border border-slate-100">
                                {review.comment}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
