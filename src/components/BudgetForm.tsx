'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const categories = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'travel', label: 'Travel' },
  { value: 'other', label: 'Other' },
];

export function BudgetForm({ budgets, onSave, isLoading }: {
  budgets: { [key: string]: number };
  onSave: (budgets: { [key: string]: number }) => void;
  isLoading?: boolean;
}) {
  const [form, setForm] = useState<{ [key: string]: number }>(budgets || {});
  const [saving, setSaving] = useState(false);

  const handleChange = (cat: string, value: string) => {
    setForm(f => ({ ...f, [cat]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Monthly Budgets</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {categories.map(cat => (
            <div key={cat.value} className="flex items-center gap-2">
              <span className="w-40">{cat.label}</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form[cat.value] || ''}
                onChange={e => handleChange(cat.value, e.target.value)}
                className="w-32"
                placeholder="₹0.00"
              />
            </div>
          ))}
          <Button type="submit" disabled={saving || isLoading} className="w-full mt-4">
            {saving || isLoading ? 'Saving...' : 'Save Budgets'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
