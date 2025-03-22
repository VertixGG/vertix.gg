import React from "react";

export interface TransactionsDisplayProps {
  transactions: string[];
}

/**
 * TransactionsDisplay component shows the list of available transactions
 */
export const TransactionsDisplay: React.FC<TransactionsDisplayProps> = ( { transactions } ) => {
  return (
    <div>
      <h3 className="font-medium mb-2">Transactions</h3>
      <div className="grid grid-cols-1 gap-2">
        {transactions.length > 0 ? (
          transactions.map( ( transaction: string, index: number ) => (
            <div
              key={index}
              className="p-2 bg-neutral-100 rounded text-sm"
            >
              {transaction}
            </div>
          ) )
        ) : (
          <p className="text-sm text-neutral-500">No transactions defined</p>
        )}
      </div>
    </div>
  );
};
