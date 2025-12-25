import Link from "next/link"
import { Github, Twitter, Facebook, Linkedin, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">DevForum</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/questions" className="text-muted-foreground hover:text-foreground">
                  Questions
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground">
                  Help
                </Link>
              </li>
              <li>
                <Link href="/mobile" className="text-muted-foreground hover:text-foreground">
                  Mobile
                </Link>
              </li>
              <li>
                <Link href="/disable-responsiveness" className="text-muted-foreground hover:text-foreground">
                  Disable Responsiveness
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Products</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/teams" className="text-muted-foreground hover:text-foreground">
                  Teams
                </Link>
              </li>
              <li>
                <Link href="/advertising" className="text-muted-foreground hover:text-foreground">
                  Advertising
                </Link>
              </li>
              <li>
                <Link href="/collectives" className="text-muted-foreground hover:text-foreground">
                  Collectives
                </Link>
              </li>
              <li>
                <Link href="/talent" className="text-muted-foreground hover:text-foreground">
                  Talent
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-muted-foreground hover:text-foreground">
                  Press
                </Link>
              </li>
              <li>
                <Link href="/work-here" className="text-muted-foreground hover:text-foreground">
                  Work Here
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-muted-foreground hover:text-foreground">
                  Legal
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/cookie-settings" className="text-muted-foreground hover:text-foreground">
                  Cookie Settings
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-muted-foreground hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              DevForum Network
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/technology" className="text-muted-foreground hover:text-foreground">
                  Technology
                </Link>
              </li>
              <li>
                <Link href="/culture-recreation" className="text-muted-foreground hover:text-foreground">
                  Culture & Recreation
                </Link>
              </li>
              <li>
                <Link href="/life-arts" className="text-muted-foreground hover:text-foreground">
                  Life & Arts
                </Link>
              </li>
              <li>
                <Link href="/science" className="text-muted-foreground hover:text-foreground">
                  Science
                </Link>
              </li>
              <li>
                <Link href="/professional" className="text-muted-foreground hover:text-foreground">
                  Professional
                </Link>
              </li>
              <li>
                <Link href="/business" className="text-muted-foreground hover:text-foreground">
                  Business
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-muted-foreground hover:text-foreground">
                  API
                </Link>
              </li>
              <li>
                <Link href="/data" className="text-muted-foreground hover:text-foreground">
                  Data
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Social Media</h3>
            <div className="flex space-x-4">
              <Link href="https://github.com" className="text-muted-foreground hover:text-foreground">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://facebook.com" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="https://linkedin.com" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="https://instagram.com" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
            <div className="mt-8">
              <p className="text-xs text-muted-foreground">
                Site design / logo © 2025 DevForum Inc; user contributions licensed under CC BY-SA.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

