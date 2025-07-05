"use client";

import React, { useEffect, useState } from "react";
import { Transaction } from "@/types/transaction";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { MonthlyExpensesChart } from "@/components/MonthlyExpensesChart";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { BudgetForm } from '@/components/BudgetForm';
import { BudgetVsActualChart } from '@/components/BudgetVsActualChart';
import { Loader2 } from "lucide-react";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [txRes, dashRes] = await Promise.all([
        fetch("/api/transactions").then((r) => r.json()),
        fetch("/api/dashboard").then((r) => r.json()),
      ]);
      
      if (txRes.error) throw new Error(txRes.error);
      if (dashRes.error) throw new Error(dashRes.error);
      
      setTransactions(txRes);
      setDashboard(dashRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const handleAdd = () => {
    setEditTx(null);
    setFormOpen(true);
  };

  const handleEdit = (tx: Transaction) => {
    setEditTx(tx);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setFormLoading(true);
      const response = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      const result = await response.json();
      
      if (result.error) throw new Error(result.error);
      
      await fetchAll();
      showSuccess('Transaction deleted successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete transaction');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setFormLoading(true);
      let response;
      
      if (editTx) {
        response = await fetch(`/api/transactions/${editTx._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        response = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
      setFormOpen(false);
      setEditTx(null);
      await fetchAll();
      showSuccess(editTx ? 'Transaction updated successfully' : 'Transaction added successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save transaction');
    } finally {
      setFormLoading(false);
    }
  };

  function getCurrentMonth() {
    if (typeof window !== 'undefined') {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    return '';
  }

  // Save budgets handler
  const handleSaveBudgets = async (budgets: { [key: string]: number }) => {
    try {
      setBudgetLoading(true);
      const monthStr = getCurrentMonth();
      // Upsert each category budget
      await Promise.all(
        Object.entries(budgets).map(async ([category, amount]) => {
          // Find if budget exists
          const existing = dashboard?.budgets?.find((b: any) => b.category === category);
          if (existing) {
            const response = await fetch(`/api/budgets/${existing._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ category, amount, month: monthStr }),
            });
            const result = await response.json();
            if (result.error) throw new Error(result.error);
          } else {
            const response = await fetch('/api/budgets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ category, amount, month: monthStr }),
            });
            const result = await response.json();
            if (result.error) throw new Error(result.error);
          }
        })
      );
      await fetchAll();
      showSuccess('Budgets saved successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save budgets');
    } finally {
      setBudgetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-2 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Notifications */}
        {error && (
          <div style={{background:'#fff',border:'1px solid #d1d5db',padding:'1rem',marginBottom:'1rem',color:'#b91c1c'}}>⚠️ {error}</div>
        )}
        {success && (
          <div style={{background:'#fff',border:'1px solid #d1d5db',padding:'1rem',marginBottom:'1rem',color:'#15803d'}}>✔ {success}</div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <h1 style={{fontWeight:'bold',fontSize:'1.25rem'}}>Personal Finance Dashboard</h1>
          <button onClick={handleAdd} disabled={formLoading} style={{border:'1px solid #d1d5db',background:'#fff',color:'#111',padding:'0.5rem 1.25rem',fontWeight:'bold',cursor:'pointer'}}>
            {formLoading ? 'Loading...' : 'Add Transaction'}
          </button>
        </div>

        {/* Summary Cards */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card text-center">
              <div style={{fontSize:'0.9rem',color:'#555'}}>Total Expenses</div>
              <div style={{fontWeight:'bold',fontSize:'1.1rem'}}>${dashboard.totalExpenses?.toFixed(2) || "0.00"}</div>
            </div>
            <div className="card text-center">
              <div style={{fontSize:'0.9rem',color:'#555'}}>Total Income</div>
              <div style={{fontWeight:'bold',fontSize:'1.1rem'}}>${dashboard.totalIncome?.toFixed(2) || "0.00"}</div>
            </div>
            <div className="card text-center">
              <div style={{fontSize:'0.9rem',color:'#555'}}>Net Amount</div>
              <div style={{fontWeight:'bold',fontSize:'1.1rem'}}>${dashboard.netAmount?.toFixed(2) || "0.00"}</div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card"><MonthlyExpensesChart data={dashboard?.monthlyExpenses || []} isLoading={loading} /></div>
          <div className="card"><CategoryPieChart data={dashboard?.categoryExpenses || []} isLoading={loading} /></div>
        </div>

        {/* Budgeting Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card"><BudgetForm budgets={Object.fromEntries((dashboard?.budgets || []).map((b: any) => [b.category, b.amount]))} onSave={handleSaveBudgets} isLoading={budgetLoading} /></div>
          <div className="card"><BudgetVsActualChart data={dashboard?.budgetVsActual || []} isLoading={loading || budgetLoading} /></div>
        </div>

        {/* Insights Section */}
        {dashboard?.insights && dashboard.insights.length > 0 && (
          <div className="card">
            <div style={{fontWeight:'bold',marginBottom:'0.5rem'}}>Spending Insights</div>
            <ul style={{paddingLeft:'1.5rem'}}>
              {dashboard.insights.map((insight: string, idx: number) => (
                <li key={idx} style={{color:'#b91c1c'}}>{insight}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Transaction List */}
        <div className="card">
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={loading || formLoading}
          />
        </div>

        {/* Transaction Form Modal */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div style={{background:'#fff',border:'1px solid #d1d5db',padding:'1.5rem',width:'100%',maxWidth:'28rem',borderRadius:0}}>
              <TransactionForm
                transaction={editTx || undefined}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setFormOpen(false);
                  setEditTx(null);
                }}
                isLoading={formLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
