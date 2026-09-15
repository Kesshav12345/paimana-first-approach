import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  size: number;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  size,
  onPageChange
}) => {
  const from = total === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(total, page * size);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#D9E1EA] bg-[#F8FAFC] text-xs text-slate-600">
      <div>
        Showing <span className="font-semibold text-slate-900">{from}</span> to{' '}
        <span className="font-semibold text-slate-900">{to}</span> of{' '}
        <span className="font-semibold text-slate-900">{total.toLocaleString()}</span> records
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 bg-white border border-[#D9E1EA] rounded-md text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Previous
        </button>
        <span className="text-slate-700 font-medium px-1">
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 bg-white border border-[#D9E1EA] rounded-md text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};
