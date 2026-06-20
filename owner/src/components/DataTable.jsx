import { Loader2 } from 'lucide-react';

export default function DataTable({
  columns,
  data,
  loading,
  error,
  emptyMessage = 'No data found',
  onRowClick,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-danger font-medium mb-1">Failed to load data</p>
        <p className="text-sm text-muted">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3 ${
                  col.hideOnMobile ? 'hidden md:table-cell' : ''
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, i) => (
            <tr
              key={row._id || i}
              onClick={() => onRowClick?.(row)}
              className={`${onRowClick ? 'cursor-pointer' : ''} hover:bg-surface-secondary transition-colors`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-sm ${col.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
