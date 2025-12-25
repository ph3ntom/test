import { memo } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown } from "lucide-react"

interface VotingControlsProps {
  votes: number
  onUpvote?: () => void
  onDownvote?: () => void
  className?: string
}

const VotingControls = memo(function VotingControls({ 
  votes, 
  onUpvote, 
  onDownvote, 
  className = "" 
}: VotingControlsProps) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onUpvote}
        aria-label="Upvote"
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
      <span className="text-lg font-semibold">{votes}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onDownvote}
        aria-label="Downvote"
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  )
})

export default VotingControls