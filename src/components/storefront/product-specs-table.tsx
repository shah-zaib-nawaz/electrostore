import React from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

interface ProductSpecsTableProps {
  specs?: Record<string, string | number | boolean>;
}

export function ProductSpecsTable({ specs }: ProductSpecsTableProps) {
  if (!specs || Object.keys(specs).length === 0) {
    return (
      <div className="rounded-xl border border-border/60 p-6 text-center text-sm text-muted-foreground bg-muted/10">
        Standard manufacturer factory specifications apply. Contact support or consult technical manual.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm">
      <div className="bg-muted/40 px-4 py-3 border-b border-border/60">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Hardware & Architecture Breakdown
        </h4>
      </div>
      <Table>
        <TableBody>
          {Object.entries(specs).map(([key, value]) => (
            <TableRow key={key} className="hover:bg-muted/30">
              <TableCell className="w-1/3 font-medium text-xs text-muted-foreground capitalize border-r border-border/40 py-2.5">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </TableCell>
              <TableCell className="text-xs font-semibold text-foreground py-2.5 font-mono">
                {String(value)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
