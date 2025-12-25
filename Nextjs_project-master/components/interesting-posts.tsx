import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

// Sample posts data
const posts = [
  {
    id: 1,
    title: "Is the JavaScript call stack actually on a stack?",
    votes: 1,
    answers: 1,
    views: 131,
    tags: ["javascript", "c++", "v8"],
    user: {
      name: "Mark Rotteveel",
      image: "/placeholder-user.jpg",
      reputation: "109k",
    },
    modifiedTime: "1 hour ago",
    description:
      "In V8, the engine is responsible for creating the JavaScript runtime call stack, which allows it to track its position within the code. The engine comprises two main components: Ignition, a...",
  },
  {
    id: 2,
    title: "How can I build mongoose model from this JSON",
    votes: 2,
    answers: 1,
    views: 4000,
    tags: ["javascript", "node.js", "express", "mongoose", "model"],
    user: {
      name: "Prawesh kumar",
      image: "/placeholder-user.jpg",
      reputation: "1",
    },
    modifiedTime: "2 hours ago",
    description:
      "I'm a beginner trying to parse this json into a mongoose model so i can save the data. This is my model right now const commentSchema = new Schema([{ sectionId: String,comments: [...",
  },
]

export default function InterestingPosts() {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground min-w-[65px]">
                <div className="flex items-center gap-1">
                  <span>{post.votes}</span>
                  <span>vote{post.votes !== 1 && "s"}</span>
                </div>
                <div
                  className={`flex items-center gap-1 ${post.answers > 0 ? "text-green-500 border border-green-500 px-2 py-1 rounded-md" : ""}`}
                >
                  <span>{post.answers}</span>
                  <span>answer{post.answers !== 1 && "s"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{post.views}</span>
                  <span>views</span>
                </div>
              </div>
              <div className="space-y-2 min-w-0">
                <Link href={`/questions/${post.id}`} className="text-lg font-medium hover:text-blue-500 line-clamp-2">
                  {post.title}
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-accent">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={post.user.image} alt={post.user.name} />
                    <AvatarFallback>{post.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-xs">
                    <Link href={`/users/${post.user.name}`} className="text-blue-500 hover:underline">
                      {post.user.name}
                    </Link>
                    <span className="mx-1">{post.user.reputation}</span>
                    <span className="text-muted-foreground">modified {post.modifiedTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

