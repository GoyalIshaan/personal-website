"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SkillBadgeProps {
  name: string
  level: number
}

export function SkillBadge({ name, level }: SkillBadgeProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="relative group">
      <div className="bg-card border rounded-full px-3 py-1.5 flex items-center gap-2">
        <span className="font-medium text-sm">{name}</span>
        <div className="h-1.5 w-12 sm:w-16 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              level >= 80 ? "bg-green-500" : level >= 60 ? "bg-blue-500" : level >= 40 ? "bg-yellow-500" : "bg-red-500",
            )}
            style={{ width: `${level}%` }}
          />
        </div>
      </div>

      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
        {level}%
      </div>
    </motion.div>
  )
}

