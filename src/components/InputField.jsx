/**
 * InputField — Slider + number input combo for the simulator.
 * The parent always owns the value; this component is fully controlled.
 */
export default function InputField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  prefix = '',
  suffix = '',
  hint = null,
}) {
  const numericValue = Number(value) || 0

  const clamp = (v) => Math.min(Math.max(Number(v) || 0, min), max)

  const handleSlider = (e) => onChange(clamp(e.target.value))

  const handleNumberInput = (e) => {
    // Allow free typing; clamp only on blur
    onChange(Number(e.target.value) || 0)
  }

  const handleBlur = (e) => onChange(clamp(e.target.value))

  const displayValue = numericValue.toLocaleString('en-IN')

  return (
    <div className="mb-5">
      {/* Label row */}
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-indigo-600">
          {prefix}{displayValue}{suffix}
        </span>
      </div>

      {/* Hint */}
      {hint && <p className="text-xs text-amber-600 mb-1.5">{hint}</p>}

      {/* Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={numericValue}
        onChange={handleSlider}
        className="slider w-full mb-2"
      />

      {/* Number input */}
      <div className="flex items-center gap-1.5">
        {prefix && (
          <span className="text-sm text-gray-400 font-medium">{prefix}</span>
        )}
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={numericValue}
          onChange={handleNumberInput}
          onBlur={handleBlur}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
        {suffix && (
          <span className="text-sm text-gray-400">{suffix}</span>
        )}
      </div>
    </div>
  )
}
