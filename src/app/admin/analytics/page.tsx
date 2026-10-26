'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LineChart, Search, Sparkles, Cpu, Clock } from 'lucide-react';

const mockSearchLogs = [
  { query: 'quiet laptop for 4k video editing under 1500', latencyMs: 142, count: 6, hasSemanticIntent: true },
  { query: 'RTX-5090-FE', latencyMs: 28, count: 1, hasSemanticIntent: false },
  { query: '240Hz OLED monitor HDR', latencyMs: 110, count: 4, hasSemanticIntent: true },
  { query: 'mechanical keyboard tactile switch', latencyMs: 84, count: 12, hasSemanticIntent: true },
  { query: 'AMD-9950X3D', latencyMs: 22, count: 1, hasSemanticIntent: false },
  { query: 'best graphics card for cyber esports', latencyMs: 165, count: 8, hasSemanticIntent: true },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search & AI Telemetry</h1>
        <p className="text-sm text-muted-foreground">
          Real-time metrics from MongoDB Atlas $rankFusion hybrid search and ElectroBot AI
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Search Latency</CardTitle>
            <Clock className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91.8 ms</div>
            <p className="text-xs text-emerald-500 mt-1">Sub-250ms target met (100%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Semantic Intent Ratio</CardTitle>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.4%</div>
            <p className="text-xs text-muted-foreground mt-1">Routed through $vectorSearch (0.7 weight)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Exact SKU Match Hit Rate</CardTitle>
            <Cpu className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.1%</div>
            <p className="text-xs text-muted-foreground mt-1">Resolved via $search token index (0.3 weight)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Live Search Execution Log
          </CardTitle>
          <CardDescription>
            Recorded asynchronously via Next.js 16 after() into SearchLog collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Search Query</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Matches</TableHead>
                <TableHead>Engine Routing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSearchLogs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-xs">
                    &quot;{log.query}&quot;
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    <span className={log.latencyMs < 100 ? 'text-emerald-500 font-bold' : 'text-foreground'}>
                      {log.latencyMs} ms
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">{log.count} items</TableCell>
                  <TableCell>
                    {log.hasSemanticIntent ? (
                      <Badge variant="default" className="text-[11px] gap-1">
                        <Sparkles className="h-3 w-3" />
                        $rankFusion (Hybrid)
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[11px]">
                        Exact SKU Token
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
