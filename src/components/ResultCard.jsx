const colorMap = {
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    label: 'text-indigo-500',
    value: 'text-indigo-700',
    sub: 'text-indigo-400',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    label: 'text-purple-500',
    value: 'text-purple-700',
    sub: 'text-purple-400',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-100',
    label: 'text-green-600',
    value: 'text-green-700',
    sub: 'text-green-500',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-100',
    label: 'text-red-500',
    value: 'text-red-600',
    sub: 'text-red-400',
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    label: 'text-gray-500',
    value: 'text-gray-800',
    sub: 'text-gray-400',
  },
}

export default function ResultCard({ label, value, subtext, color = 'indigo', icon: Icon }) {
  const c = colorMap[color] ?? colorMap.gray

  return (
    <div className={`rounded-xl border p-4 ${c.bg} ${c.border}`}>
      <div className="flex items-start justify-between mb-1">
        <p className={`text-xs font-semibold uppercase tracking-wide ${c.label}`}>{label}</p>
        {Icon && <Icon size={16} className={c.label} />}
      </div>
      <p className={`text-2xl font-bold leading-tight ${c.value}`}>{value}</p>
      {subtext && <p className={`text-xs mt-1 ${c.sub}`}>{subtext}</p>}
    </div>
  )
}
