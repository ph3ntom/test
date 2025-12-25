import Link from "next/link"
import { memo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/types"

interface UserInfoProps {
  user: User
  askedTime: string
  className?: string
}

const UserInfo = memo(function UserInfo({ user, askedTime, className = "" }: UserInfoProps) {
  return (
    <div className={`flex items-center gap-2 bg-accent/50 p-2 rounded-md ${className}`}>
      <div className="text-xs text-muted-foreground">
        asked {askedTime}
      </div>
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>
        <div>
          <Link href={`/users/${user.name}`} className="text-xs font-medium hover:underline">
            {user.name}
          </Link>
          <div className="text-xs text-muted-foreground">{user.reputation}</div>
        </div>
      </div>
    </div>
  )
})

export default UserInfo