'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { getCategoriesAction, createCategoryAction } from '@/actions/admin-catalog';
import { Layers, Plus, FolderTree } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategoriesAction();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    await createCategoryAction({
      name,
      slug: slug.toLowerCase(),
      description,
      displayOrder: categories.length + 1,
    });

    setName('');
    setSlug('');
    setDescription('');
    loadCategories();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Category Hierarchy</h1>
        <p className="text-sm text-muted-foreground">
          Manage taxonomy for hardware navigation and vector filter clauses
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Create Category Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              New Category
            </CardTitle>
            <CardDescription>Add a new category to the navigation tree</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Category Name</label>
                <Input
                  placeholder="e.g. Graphics Cards"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Slug (URL Path)</label>
                <Input
                  placeholder="e.g. gpus"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Description</label>
                <Input
                  placeholder="Category overview..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full mt-2">
                Create Category
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Categories Tree */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-primary" />
              Active Categories ({categories.length})
            </CardTitle>
            <CardDescription>Hierarchical taxonomy mapped to MongoDB collections</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading taxonomy...</div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No categories created yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell className="font-mono text-xs">{c.displayOrder}</TableCell>
                      <TableCell className="font-semibold">{c.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">/{c.slug}</TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-xs">
                        {c.description || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
