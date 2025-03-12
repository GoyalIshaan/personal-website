"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface ProjectCardProps {
  title: string
  description: string
  tags: string[]
  image: string
  githubUrl: string
  demoUrl?: string
  category?: string
}

export function ProjectCard({ title, description, tags, image, githubUrl, demoUrl, category }: ProjectCardProps) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden h-full flex flex-col border-2 hover:border-primary/50 transition-colors">
        <div className="overflow-hidden relative">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        <CardHeader className="p-4 pb-2">
          <h3 className="text-lg sm:text-xl font-bold line-clamp-1">{title}</h3>
        </CardHeader>

        <CardContent className="flex-grow p-4 pt-2">
          <p className="text-muted-foreground mb-4 text-sm line-clamp-3">{description}</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 p-4 pt-0">
          <Button variant="outline" size="sm" className="gap-1 text-xs flex-1" asChild>
            <Link href={githubUrl}>
              <Github className="h-3 w-3" />
              <span>Code</span>
            </Link>
          </Button>

          {demoUrl && (
            <Button size="sm" className="gap-1 text-xs flex-1" asChild>
              <Link href={demoUrl}>
                <ExternalLink className="h-3 w-3" />
                <span>Demo</span>
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

