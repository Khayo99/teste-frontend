import type { ChangeEvent } from 'react'

export function AuthInput({
  id,
  label,
  type = 'text',
  value,
  error,
  onChange
}: {
  id: string
  label: string
  type?: string
  value: string
  error?: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  const errorId = `${id}-error`
  return (
    <div>
      <label className="mb-2 block text-sm font-bold" htmlFor={id}>
        {label}
      </label>
      <input
        className="w-full rounded-md border border-border-soft bg-ink px-4 py-3 text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40"
        id={id}
        name={id}
        type={type}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={onChange}
      />
      {error && (
        <p className="mt-2 text-xs text-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
