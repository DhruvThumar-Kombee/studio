
'use client';

import * as React from 'react';
import type { Transaction } from '@/types';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, PlusCircle, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { deleteTransactionAction, getTransactionsAction } from '@/actions/transactionActions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TransactionForm } from './TransactionForm';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  initialTransactions: Transaction[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

export function TransactionTable({ initialTransactions }: TransactionTableProps) {
  const { toast } = useToast();
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions);
  
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [transactionToDelete, setTransactionToDelete] = React.useState<Transaction | null>(null);

  const refreshTransactions = async () => {
    try {
      const updatedTransactions = await getTransactionsAction();
      setTransactions(updatedTransactions);
    } catch (error) {
      toast({ title: "Error", description: "Failed to refresh transaction list.", variant: "destructive" });
    }
  };

  React.useEffect(() => {
    setTransactions(initialTransactions.map(t => ({...t, date: new Date(t.date) })));
  }, [initialTransactions]);

  const handleFormSubmitSuccess = () => {
    refreshTransactions();
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    setShowDeleteDialog(false);
    const result = await deleteTransactionAction(transactionToDelete.id);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      refreshTransactions();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setTransactionToDelete(null);
  };

  if (!transactions || transactions.length === 0) {
    return (
       <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground mt-4 mb-4">No transactions found. Add a new transaction to get started.</p>
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Transaction
        </Button>
        {isFormOpen && (
          <TransactionForm
            transaction={editingTransaction}
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            onFormSubmitSuccess={handleFormSubmitSuccess}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Transaction
        </Button>
      </div>
      <ScrollArea className="max-h-[600px] w-full rounded-md border">
        <Table>
          <TableCaption>A list of your recent financial transactions.</TableCaption>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{format(transaction.date, 'PPP')}</TableCell>
                <TableCell>
                  <Badge variant={transaction.type === 'Income' ? 'default' : 'destructive'}
                         className={cn(
                            transaction.type === 'Income' && 'bg-green-500 hover:bg-green-600 text-white',
                            transaction.type === 'Expense' && 'bg-red-500 hover:bg-red-600 text-white'
                         )}
                  >
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate">{transaction.description}</TableCell>
                <TableCell className="hidden md:table-cell">{transaction.category || 'N/A'}</TableCell>
                <TableCell className={cn(
                    "text-right font-semibold",
                    transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(transaction)} 
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {isFormOpen && (
          <TransactionForm
            transaction={editingTransaction}
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            onFormSubmitSuccess={handleFormSubmitSuccess}
          />
        )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              Transaction: "{transactionToDelete?.description}" on {transactionToDelete ? format(transactionToDelete.date, 'PPP') : ''} for {transactionToDelete ? formatCurrency(transactionToDelete.amount) : ''}.<br/>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
