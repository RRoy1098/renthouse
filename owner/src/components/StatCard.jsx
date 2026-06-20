export default function StatCard({ icon: Icon, label, value, subtext, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary-100 text-primary-600',
    accent: 'bg-accent-100 text-accent-600',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
  };

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted font-medium">{label}</p>
        <div className={`w-10 h-10 rounded-lg ${colorMap[color] || colorMap.primary} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      {subtext && <p className="text-xs text-muted mt-1">{subtext}</p>}
    </div>
  );
}
