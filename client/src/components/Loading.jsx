export default function Loading({ label = 'Loading...' }) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" />
      {label}
    </div>
  )
}
