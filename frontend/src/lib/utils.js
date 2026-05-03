export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';

export const statusClasses = {
  Available: 'bg-emerald-500/15 text-emerald-300',
  Booked: 'bg-amber-500/15 text-amber-300',
  Charging: 'bg-sky-500/15 text-sky-300',
  Completed: 'bg-emerald-500/15 text-emerald-300',
  Pending: 'bg-slate-500/15 text-slate-300',
  Cancelled: 'bg-rose-500/15 text-rose-300',
  Paid: 'bg-emerald-500/15 text-emerald-300',
  Failed: 'bg-rose-500/15 text-rose-300',
  Maintenance: 'bg-orange-500/15 text-orange-300',
  Inactive: 'bg-slate-500/15 text-slate-300',
};
