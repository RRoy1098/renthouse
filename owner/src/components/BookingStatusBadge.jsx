const statusStyles = {
  pending: 'bg-warning-light text-warning border-warning/20',
  seen: 'bg-info-light text-info border-info/20',
  accepted: 'bg-success-light text-success border-success/20',
  confirmed: 'bg-success-light text-success border-success/20',
  rejected: 'bg-danger-light text-danger border-danger/20',
  cancelled: 'bg-danger-light text-danger border-danger/20',
  completed: 'bg-surface-secondary text-muted-dark border-border',
};

export default function BookingStatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();
  const styles = statusStyles[normalized] || 'bg-surface-tertiary text-muted border-border';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      {normalized.charAt(0).toUpperCase() + normalized.slice(1) || 'Unknown'}
    </span>
  );
}
