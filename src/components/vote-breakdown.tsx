import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface VoteBreakdownProps {
  suggestion: {
    votes: {
      voter_name: string
      vote_type: "yes" | "no" | "maybe"
    }[]
  }
}

export function VoteBreakdown({ suggestion }: VoteBreakdownProps) {
  const yesVotes = suggestion.votes.filter(v => v.vote_type === "yes")
  const noVotes = suggestion.votes.filter(v => v.vote_type === "no")
  const maybeVotes = suggestion.votes.filter(v => v.vote_type === "maybe")

  return (
    <div className="mt-4 space-y-3 text-sm">
      {yesVotes.length > 0 && (
        <div>
          <h4 className="font-semibold text-green-400 mb-1">Yes</h4>
          <div className="flex flex-wrap gap-1">
            {yesVotes.map(v => (
              <span key={v.id} className="bg-green-900/30 text-green-300 px-2 py-1 rounded text-xs">
                {v.voter_name}
              </span>
            ))}
          </div>
        </div>
      )}
      {noVotes.length > 0 && (
        <div>
          <h4 className="font-semibold text-red-400 mb-1">No</h4>
          <div className="flex flex-wrap gap-1">
            {noVotes.map(v => (
              <span key={v.id} className="bg-red-900/30 text-red-300 px-2 py-1 rounded text-xs">
                {v.voter_name}
              </span>
            ))}
          </div>
        </div>
      )}
      {maybeVotes.length > 0 && (
        <div>
          <h4 className="font-semibold text-yellow-400 mb-1">Don&apos;t Know</h4>
          <div className="flex flex-wrap gap-1">
            {maybeVotes.map(v => (
              <span key={v.id} className="bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded text-xs">
                {v.voter_name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

