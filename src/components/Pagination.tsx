type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export const Pagination = ({ page, totalPages, onPageChange }: Props) => {
  return (
    <div className="flex items-center justify-end gap-2">
      <button className="btn-secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
      <button className="btn-secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </div>
  );
};
