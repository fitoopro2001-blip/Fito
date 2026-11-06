'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { H3, Text } from '../atoms/Typography';
import Button from '../atoms/Button';
import Card from '../atoms/Card';
import Avatar from '../atoms/Avatar';
import TextArea from '../atoms/TextArea';
import Spinner from '../atoms/Spinner';
import Rating from '../molecules/Rating';
import useAuth from '../../hooks/useAuth';
import useApiResource from '../../hooks/useApiResource';
import {
  getProductReviews,
  createReview,
  updateMyReview,
  deleteMyReview,
} from '../../services/review.service';

const errorMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

export default function ReviewSection({
  productId,
  rating = 0,
  reviewCount = 0,
  onRatingChange,
}) {
  const { user, isAuthenticated } = useAuth();

  const {
    data: apiReviews,
    loading,
    setData: setApiReviews,
  } = useApiResource(() => getProductReviews(productId), [productId], {
    skip: !productId,
    fallback: [],
  });

  const reviews = apiReviews ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reviews are one-per-user, so this is either their review or undefined.
  const myReview = useMemo(() => {
    if (!user?.id) return null;
    return reviews.find((r) => String(r.userId) === String(user.id)) ?? null;
  }, [reviews, user?.id]);

  const breakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
      counts[idx] += 1;
    });
    const total = reviews.length || 1;
    return counts
      .map((count, idx) => ({ stars: idx + 1, count, pct: Math.round((count / total) * 100) }))
      .reverse();
  }, [reviews]);

  // Averages are recomputed locally so the summary updates without a refetch.
  const notifyRatingChange = (nextReviews) => {
    if (!onRatingChange) return;
    const count = nextReviews.length;
    const avg = count
      ? Math.round((nextReviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
      : 0;
    onRatingChange({ rating: avg, reviewCount: count });
  };

  const resetForm = () => {
    setScore(0);
    setComment('');
    setError('');
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (review) => {
    setEditingId(review.id);
    setScore(review.rating);
    setComment(review.comment);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!score || !comment.trim()) {
      setError('Please add a rating and a comment.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        const updated = await updateMyReview(editingId, { rating: score, comment });
        const next = (apiReviews ?? []).map((r) => (r.id === editingId ? updated : r));
        setApiReviews(next);
        notifyRatingChange(next);
      } else {
        const created = await createReview({ productId, rating: score, comment });
        const next = [created, ...(apiReviews ?? [])];
        setApiReviews(next);
        notifyRatingChange(next);
      }
      resetForm();
    } catch (err) {
      setError(errorMessage(err, 'Could not save your review. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMyReview(id);
      const next = (apiReviews ?? []).filter((r) => r.id !== id);
      setApiReviews(next);
      notifyRatingChange(next);
      if (editingId === id) resetForm();
    } catch (err) {
      setError(errorMessage(err, 'Could not delete your review.'));
    }
  };

  const canWrite = isAuthenticated;
  const alreadyReviewed = !!myReview && !editingId;

  return (
    <div className="mt-16 border-t border-white/10 pt-12">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <H3 className="text-2xl font-bold text-white">Customer Reviews</H3>

        {canWrite ? (
          alreadyReviewed ? (
            <Button variant="outline" size="md" onClick={() => openEdit(myReview)}>
              Edit Your Review
            </Button>
          ) : (
            <Button
              variant="outline"
              size="md"
              onClick={() => (showForm ? resetForm() : setShowForm(true))}
            >
              {showForm ? 'Cancel' : 'Write a Review'}
            </Button>
          )
        ) : (
          <Link href="/login" className="text-sm text-primary font-medium hover:underline">
            Log in to write a review →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
        <div>
          <div className="text-5xl font-bold text-white">{Number(rating).toFixed(1)}</div>
          <Rating value={Math.round(rating)} className="my-2" />
          <Text className="text-gray-400">Based on {reviewCount} reviews</Text>
        </div>

        <div className="md:col-span-2 flex flex-col gap-2 justify-center">
          {breakdown.map((row) => (
            <div key={row.stars} className="flex items-center gap-3 text-sm text-gray-400">
              <span className="w-12 shrink-0">{row.stars} star</span>
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-yellow-400" style={{ width: `${row.pct}%` }} />
              </div>
              <span className="w-8 text-right shrink-0">{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      {showForm && canWrite && (
        <Card className="bg-white/5 border border-white/10 mb-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Your Rating</label>
              <Rating value={score} onChange={setScore} />
            </div>
            <TextArea
              id="review-comment"
              label="Your Review"
              placeholder="Tell others what you think about this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {error && <Text className="text-red-400 text-sm">{error}</Text>}
            <div className="flex items-center gap-3">
              <Button type="submit" variant="primary" loading={submitting}>
                {editingId ? 'Update Review' : 'Submit Review'}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={() => handleDelete(editingId)}>
                  Delete Review
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner className="w-6 h-6" />
        </div>
      ) : reviews.length === 0 ? (
        <Text className="text-gray-400">No reviews yet. Be the first to share your thoughts!</Text>
      ) : (
        <div className="flex flex-col gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-4 border-b border-white/10 pb-6 last:border-0">
              <Avatar name={r.name} />
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-semibold text-white">{r.name}</span>
                  <span className="text-xs text-gray-500">{r.date}</span>
                </div>
                <Rating value={r.rating} className="my-1" size="w-4 h-4" />
                <Text className="text-gray-300">{r.comment}</Text>

                {/* Replies are authored in the admin panel by the super admin —
                    read-only here. */}
                {(r.replies ?? []).length > 0 && (
                  <div className="mt-4 flex flex-col gap-3 pl-4 border-l-2 border-primary/30">
                    {r.replies.map((reply) => (
                      <div key={reply.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {reply.authorName}
                          </span>
                          {reply.authorType === 'admin' && (
                            <span className="text-[10px] uppercase tracking-wide bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              Fitoo Team
                            </span>
                          )}
                        </div>
                        <Text className="text-gray-400 text-sm mt-0.5">{reply.message}</Text>
                      </div>
                    ))}
                  </div>
                )}

                {myReview?.id === r.id && (
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => openEdit(r)}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="text-xs text-gray-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
