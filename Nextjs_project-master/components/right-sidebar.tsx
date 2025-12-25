import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function RightSidebar() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>The DevForum Blog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Link href="#" className="flex items-center gap-2 text-sm hover:text-primary">
              <span>📈</span> Can climate tech startups address the current crisis?
            </Link>
            <Link href="#" className="flex items-center gap-2 text-sm hover:text-primary">
              <span>🚀</span> What we learned at TDX 2025
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured on Meta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Link href="#" className="flex items-center gap-2 text-sm hover:text-primary">
              <Badge variant="outline">Community</Badge> Asks Sprint Announcement - March 2025
            </Link>
            <Link href="#" className="flex items-center gap-2 text-sm hover:text-primary">
              <Badge variant="outline">Meta</Badge> DevForum Exchange site maintenance scheduled starting Monday, March
              17, 2025
            </Link>
            <Link href="#" className="flex items-center gap-2 text-sm hover:text-primary">
              <Badge variant="outline">Policy</Badge> Generative AI (e.g., ChatGPT) is banned
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Collectives</span>
            <Link href="/collectives" className="text-xs text-primary hover:underline">
              see all
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 rounded-md bg-orange-100 p-2">
                <AvatarImage src="/placeholder.svg" alt="Mobile Development" />
                <AvatarFallback className="rounded-md bg-orange-100 text-orange-900">MD</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-medium">Mobile Development</h3>
                <p className="text-xs text-muted-foreground">21k Members</p>
                <p className="text-xs text-muted-foreground">
                  A collective for developers who want to share their knowledge and learn more...
                </p>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Join
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 rounded-md bg-purple-100 p-2">
                <AvatarImage src="/placeholder.svg" alt="PHP" />
                <AvatarFallback className="rounded-md bg-purple-100 text-purple-900">PHP</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-medium">PHP</h3>
                <p className="text-xs text-muted-foreground">14k Members</p>
                <p className="text-xs text-muted-foreground">
                  A collective where developers working with PHP can learn and connect about the ope...
                </p>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Join
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

