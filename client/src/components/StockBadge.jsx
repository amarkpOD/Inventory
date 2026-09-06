import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const StockBadge = ({ status, quantity }) => {
  if (status === 'Out of Stock' || quantity === 0) {
    return (
      <span className="badge badge-danger">
        <XCircle size={13} />
        Out of Stock
      </span>
    );
  }

  if (status === 'Low Stock') {
    return (
      <span className="badge badge-warning">
        <AlertTriangle size={13} />
        Low Stock ({quantity})
      </span>
    );
  }

  return (
    <span className="badge badge-success">
      <CheckCircle2 size={13} />
      In Stock ({quantity})
    </span>
  );
};

export default StockBadge;
