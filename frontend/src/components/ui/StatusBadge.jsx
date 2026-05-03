import { statusClasses } from '../../lib/utils';

export default function StatusBadge({ value }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[value] || 'bg-slate-700 text-slate-200'}`}>
      {value}
    </span>
  );
}
