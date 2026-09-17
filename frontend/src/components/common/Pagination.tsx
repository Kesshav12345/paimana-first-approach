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
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#D9E0E5] bg-[#FFFFFF] text-sm text-[#66737D]">
      <div>
        Showing <span className="font-bold text-[#25313B] tabular-nums">{from}</span> to{' '}
        <span className="font-bold text-[#25313B] tabular-nums">{to}</span> of{' '}
        <span className="font-bold text-[#25313B] tabular-nums">{total.toLocaleString()}</span> records
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3.5 py-1.5 bg-[#FFFFFF] border border-[#D9E0E5] rounded-xs text-sm text-[#25313B] hover:bg-[#F6F7F8] hover:text-[#187A9E] hover:border-[#187A9E] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Previous
        </button>
        <span className="text-[#123F63] font-bold px-1 tabular-nums text-sm">
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3.5 py-1.5 bg-[#FFFFFF] border border-[#D9E0E5] rounded-xs text-sm text-[#25313B] hover:bg-[#F6F7F8] hover:text-[#187A9E] hover:border-[#187A9E] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};
