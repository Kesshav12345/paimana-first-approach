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
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#DDD9D0] bg-[#FAF8F5] text-xs text-[#66736D]">
      <div>
        Showing <span className="font-semibold text-[#26312D] tabular-nums">{from}</span> to{' '}
        <span className="font-semibold text-[#26312D] tabular-nums">{to}</span> of{' '}
        <span className="font-semibold text-[#26312D] tabular-nums">{total.toLocaleString()}</span> records
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 bg-white border border-[#DDD9D0] rounded-md text-[#26312D] hover:bg-[#F6F3EC] hover:border-[#173F35] font-medium shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Previous
        </button>
        <span className="text-[#26312D] font-medium px-1 tabular-nums">
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 bg-white border border-[#DDD9D0] rounded-md text-[#26312D] hover:bg-[#F6F3EC] hover:border-[#173F35] font-medium shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};
