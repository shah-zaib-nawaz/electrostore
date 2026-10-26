'use client';

import React, { useState } from 'react';
import { Star, CheckCircle, ThumbsUp, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  helpfulCount: number;
}

const SAMPLE_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Alex R.',
    rating: 5,
    date: '2 days ago',
    title: 'Unbelievable performance uplift',
    comment:
      'Thermals stay under 62C under 100% 4K ray tracing workload. Packaging was immaculate and shipping arrived in under 24 hours.',
    verified: true,
    helpfulCount: 19,
  },
  {
    id: 'rev-2',
    author: 'Elena V.',
    rating: 5,
    date: '1 week ago',
    title: 'Top tier build quality & silent fans',
    comment:
      'Zero coil whine, flawless memory overclocking headroom. Worth every penny for both AI inference and 240Hz competitive gaming.',
    verified: true,
    helpfulCount: 12,
  },
  {
    id: 'rev-3',
    author: 'Marcus K.',
    rating: 4,
    date: '2 weeks ago',
    title: 'Incredible speed, requires hefty PSU',
    comment:
      'Make sure you have at least an ATX 3.1 1000W power supply with native 12V-2x6 cable. Otherwise runs like a dream.',
    verified: true,
    helpfulCount: 7,
  },
];

export function ProductReviews({
  productId,
  productName,
  averageRating = 4.8,
  totalReviews = 38,
}: {
  productId: string;
  productName: string;
  averageRating?: number;
  totalReviews?: number;
}) {
  const [reviews, setReviews] = useState<ReviewItem[]>(SAMPLE_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [helpfulVoted, setHelpfulVoted] = useState<Record<string, boolean>>({});

  const handleHelpful = (id: string) => {
    if (helpfulVoted[id]) return;
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );
    setHelpfulVoted((prev) => ({ ...prev, [id]: true }));
    toast.success('Marked as helpful');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !newTitle.trim()) {
      toast.error('Please provide a title and review comment');
      return;
    }

    const created: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: 'You (Verified Buyer)',
      rating: newRating,
      date: 'Just now',
      title: newTitle,
      comment: newComment,
      verified: true,
      helpfulCount: 0,
    };

    setReviews([created, ...reviews]);
    setNewTitle('');
    setNewComment('');
    setShowForm(false);
    toast.success('Thank you! Your verified review has been published.');
  };

  return (
    <div className="space-y-8">
      {/* Top Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        {/* Score */}
        <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border/60 pb-6 md:pb-0 md:pr-6">
          <div className="text-5xl font-black text-foreground">{averageRating.toFixed(1)}</div>
          <div className="flex items-center text-amber-500 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(averageRating) ? 'fill-current' : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on {totalReviews} verified owner ratings
          </p>
        </div>

        {/* Breakdown Bars */}
        <div className="space-y-2 flex flex-col justify-center">
          {[
            { stars: 5, pct: 85 },
            { stars: 4, pct: 10 },
            { stars: 3, pct: 3 },
            { stars: 2, pct: 1 },
            { stars: 1, pct: 1 },
          ].map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2 text-xs">
              <span className="w-12 font-medium text-muted-foreground">{bar.stars} star</span>
              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${bar.pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-[11px] text-muted-foreground font-mono">
                {bar.pct}%
              </span>
            </div>
          ))}
        </div>

        {/* Write Review CTA */}
        <div className="flex flex-col items-center justify-center text-center border-t md:border-t-0 md:border-l border-border/60 pt-6 md:pt-0 md:pl-6 space-y-3">
          <h4 className="font-bold text-sm text-foreground">Own this device?</h4>
          <p className="text-xs text-muted-foreground max-w-xs">
            Share your hardware benchmarks, thermal metrics, and real-world experience with the community.
          </p>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'outline' : 'default'}
            size="sm"
            className="text-xs"
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            {showForm ? 'Cancel Review' : 'Write Verified Review'}
          </Button>
        </div>
      </div>

      {/* Write Review Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="rounded-xl border border-primary/40 bg-card p-6 space-y-4 shadow-md"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-foreground">Write a Review for {productName}</h4>
            {/* Interactive Stars */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  className="text-amber-500 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= newRating ? 'fill-current' : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Review Headline</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Blown away by the 240Hz clarity and silence"
              className="text-xs"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Your Thoughts</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Describe real-world benchmarks, frame rates, thermals, or everyday impressions..."
              rows={4}
              className="w-full rounded-md border border-input bg-background p-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>

          <Button type="submit" size="sm" className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            <span>Publish Review</span>
          </Button>
        </form>
      )}

      {/* Review List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="rounded-xl border border-border/60 bg-card p-5 space-y-2.5 transition-colors hover:border-border"
          >
            {/* Top row: Rating & Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < rev.rating ? 'fill-current' : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <h5 className="font-bold text-xs text-foreground">{rev.title}</h5>
              </div>
              <span className="text-[11px] text-muted-foreground">{rev.date}</span>
            </div>

            {/* Content */}
            <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>

            {/* Bottom row: Author, Verified badge, helpful vote */}
            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{rev.author}</span>
                {rev.verified && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle className="h-3 w-3" /> Verified Purchase
                  </span>
                )}
              </div>

              <button
                onClick={() => handleHelpful(rev.id)}
                disabled={helpfulVoted[rev.id]}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  helpfulVoted[rev.id]
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <ThumbsUp className="h-3 w-3" />
                <span>Helpful ({rev.helpfulCount})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
