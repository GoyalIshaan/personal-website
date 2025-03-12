"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface ExperienceCardProps {
  title: string
  company: string
  date: string
  description: string
  skills: string[]
}

export function ExperienceCard({ title, company, date, description, skills }: ExperienceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-primary font-medium">{company}</p>
            </div>
            <p className="text-sm text-muted-foreground">{date}</p>
          </div>
        </CardHeader>

        <CardContent>
          <p className="mb-4">{description}</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

