export function TypingIndicator() {
  return (
    <div className="mb-4 flex justify-start">
      <div className="rounded-2xl bg-gray-100 px-4 py-3">
        <div className="flex space-x-1">
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
