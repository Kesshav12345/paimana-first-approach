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
    <div className="flex items-center justify-between px-4 py-3 border-t-2 border-[#B8D9F2] bg-[#F0F6FB] text-xs text-[#4A6572]">
      <div>
        Showing <span className="font-bold text-[#0A365C] tabular-nums">{from}</span> to{' '}
        <span className="font-bold text-[#0A365C] tabular-nums">{to}</span> of{' '}
        <span className="font-bold text-[#0A365C] tabular-nums">{total.toLocaleString()}</span> records
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 bg-white border border-[#B8D9F2] rounded-md text-[#0A365C] hover:bg-[#E1EFF9] hover:border-[#1BA0E2] font-semibold shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Previous
        </button>
        <span className="text-[#0A365C] font-bold px-1 tabular-nums">
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 bg-white border border-[#B8D9F2] rounded-md text-[#0A365C] hover:bg-[#E1EFF9] hover:border-[#1BA0E2] font-semibold shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};
