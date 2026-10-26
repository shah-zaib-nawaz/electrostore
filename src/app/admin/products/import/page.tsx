'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { bulkImportProductsAction } from '@/actions/admin-catalog';
import { Upload, FileSpreadsheet, ArrowLeft, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const sampleImportData = [
  {
    name: 'NVIDIA GeForce RTX 5090 32GB GDDR7',
    slug: 'rtx-5090-32gb',
    sku: 'RTX-5090-FE',
    price: 1999.99,
    categorySlug: 'gpus',
    brandSlug: 'nvidia',
    description: 'Blackwell architecture GPU delivering 3.5x ray tracing efficiency with DLSS 4.0 neural rendering.',
    shortDescription: 'Flagship 32GB enthusiast graphics card.',
    stock: 25,
    isActive: true,
    tags: 'nvidia,blackwell,rtx5090,gpu,flagship',
  },
  {
    name: 'AMD Ryzen 9 9950X3D 16-Core Processor',
    slug: 'ryzen-9-9950x3d',
    sku: 'AMD-9950X3D',
    price: 699.99,
    categorySlug: 'processors',
    brandSlug: 'amd',
    description: 'Zen 5 desktop processor with 2nd generation 3D V-Cache delivering unparalleled gaming performance.',
    shortDescription: '16-Core 32-Thread powerhouse with 144MB cache.',
    stock: 40,
    isActive: true,
    tags: 'amd,ryzen,9950x3d,cpu,zen5',
  },
  {
    name: 'ASUS ROG Swift 32" 4K OLED 240Hz Gaming Monitor',
    slug: 'asus-rog-swift-32-oled-240hz',
    sku: 'ROG-PG32UCDP',
    price: 1299.99,
    categorySlug: 'monitors',
    brandSlug: 'asus',
    description: 'Dual-mode 4K 240Hz or FHD 480Hz QD-OLED gaming monitor with 0.03ms response time and G-Sync.',
    shortDescription: '32-inch 4K OLED 240Hz display.',
    stock: 15,
    isActive: true,
    tags: 'asus,rog,oled,monitor,240hz,4k',
  },
];

export default function AdminProductImportPage() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(sampleImportData, null, 2));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    setLoading(true);
    setResult(null);

    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        alert('Input must be a JSON array of product objects');
        return;
      }

      const res = await bulkImportProductsAction(parsed);
      setResult(res);
    } catch (err: any) {
      alert(`Invalid JSON format: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">High-Speed Bulk Product Import</h1>
          <p className="text-sm text-muted-foreground">
            AOT Zod v4 compiled validation with batch OpenAI embeddings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Bulk Dataset (JSON / CSV Format)
          </CardTitle>
          <CardDescription>
            Paste your raw catalog batch. Rows will be validated instantly before bulk insertion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="w-full h-80 font-mono text-xs rounded-lg border border-input bg-muted/40 p-4 focus:outline-none focus:ring-1 focus:ring-ring"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            disabled={loading}
          />

          {result && (
            <div className={`rounded-lg p-4 border text-sm ${result.success ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-destructive/10 border-destructive/20'}`}>
              <div className="flex items-center gap-2 font-semibold">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                <span>Import Status: {result.imported} products inserted into MongoDB</span>
              </div>
              {result.failedCount > 0 && (
                <p className="text-xs text-destructive mt-1">
                  {result.failedCount} rows had validation errors.
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-border pt-4">
          <Button variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button onClick={handleImport} disabled={loading} className="flex items-center gap-1.5">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Execute Bulk Import
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
