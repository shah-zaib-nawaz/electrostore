'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { getReviewsAction, moderateReviewAction } from '@/actions/admin-operations';
import { Star, Check, X, Loader2 } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await getReviewsAction();
      setReviews(data);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: string, status: 'approved' | 'rejected') => {
    setActionId(id);
    try {
      await moderateReviewAction(id, status);
      loadReviews();
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Review Moderation</h1>
        <p className="text-sm text-muted-foreground">
          Approve or reject customer reviews with automatic atomic rating recalculation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Customer Submissions ({reviews.length})
          </CardTitle>
          <CardDescription>
            Approving updates Product.ratings.avg and Product.ratings.count in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No customer reviews submitted.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-semibold text-xs">
                      {r.product?.name || 'Hardware SKU'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.user?.name || 'Customer'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-amber-500 font-bold text-xs">
                        <Star className="h-3.5 w-3.5 fill-current mr-1" />
                        {r.rating}/5
                      </div>
                    </TableCell>
                    <TableCell className="text-xs max-w-sm">
                      <div className="font-medium text-foreground">{r.title}</div>
                      <div className="text-muted-foreground truncate">{r.comment}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.status === 'approved'
                            ? 'success'
                            : r.status === 'rejected'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {r.status !== 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionId === r._id}
                          onClick={() => handleModerate(r._id, 'approved')}
                          className="h-7 text-xs text-emerald-600 hover:bg-emerald-50"
                        >
                          {actionId === r._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                          Approve
                        </Button>
                      )}
                      {r.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionId === r._id}
                          onClick={() => handleModerate(r._id, 'rejected')}
                          className="h-7 text-xs text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
