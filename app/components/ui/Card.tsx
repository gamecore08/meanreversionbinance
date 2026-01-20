export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl bg-gray-900/60 border border-gray-800 shadow-lg ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, right, subtitle }) {
  return (
    <div className="px-5 py-4 border-b border-gray-800 flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-gray-100">{title}</h3>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  )
}

export function CardBody({ children }) {
  return <div className="p-5">{children}</div>
}
