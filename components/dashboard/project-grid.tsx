import React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { ProjectProgress } from "@/components/ui/project-progress"
import { formatCompactCurrency, capitalizeStatus } from "@/lib/utils"
import type { Project } from "@/hooks/use-projects"

interface ProjectGridProps {
  projects: Project[]
}

/** normalize statuses like "Not Started", "not_started" -> "not-started" */
function norm(s?: string) {
  return (s || "").trim().toLowerCase().replace(/[_\s]+/g, "-")
}

/**
 * Choose a display status with priority:
 *  1) active (from either project.active_milestone_status or project.status)
 *  2) otherwise use active_milestone_status if present
 *  3) otherwise fall back to project.status
 *  4) default "pending"
 *
 * This ensures when you have both an "active" and "not-started" milestone,
 * the badge shows "active".
 */
function pickDisplayStatus(p: Project): string {
  const ms = norm((p as any).active_milestone_status) // keep type flexible if field is not typed in Project
  const ps = norm(p.status)

  if (ms === "active" || ps === "active") return "active"
  if (ms) return ms
  if (ps) return ps
  return "pending"
}

export const ProjectGrid = React.memo(function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {projects.map((project) => {
        const displayStatus = pickDisplayStatus(project)

        return (
          <Card
            key={project.id}
            className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-[#1b7382] transition-colors duration-300 group"
            style={{ borderRadius: "var(--wui-border-radius-m)", borderWidth: "1px" }}
          >
            <Link href={`/individual-project?id=${project.id}`} className="block cursor-pointer h-full">
              <CardContent className="p-4 md:p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3
                    className="text-white font-semibold text-base md:text-lg"
                    style={{
                      fontFamily: "var(--font-sf-rounded)",
                      letterSpacing: "0.0025em",
                      lineHeight: "145%",
                    }}
                  >
                    {(() => {
                      const title = project.name.charAt(0).toUpperCase() + project.name.slice(1)
                      return title.length > 60 ? `${title.slice(0, 60)}...` : title
                    })()}
                  </h3>

                  {/* Use the prioritized status */}
                  <StatusBadge status={displayStatus} className="text-xs" />
                </div>

                <p
                  className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4 flex-1 break-words"
                  style={{
                    fontFamily: "var(--font-sf-rounded)",
                    lineHeight: "150%",
                    letterSpacing: "0.0015em",
                  }}
                >
                  {project.description && project.description.length > 200
                    ? `${project.description.slice(0, 200)}...`
                    : project.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-white text-xs md:text-sm" style={{ fontFamily: "var(--font-sf-rounded)" }}>
                    Budget: {project.funding_amount ? formatCompactCurrency(project.funding_amount) : "N/A"}
                  </span>
                  <span className="text-muted-foreground text-xs md:text-sm" style={{ fontFamily: "var(--font-sf-rounded)" }}>
                    {project.duration || "Duration: TBD"}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className="bg-blue-600/10 text-blue-300 border-blue-600/20 text-xs"
                    style={{ borderRadius: "var(--wui-border-radius-xs)" }}
                  >
                    {capitalizeStatus(project.category || "General")}
                  </Badge>
                  <span className="text-white font-semibold text-xs md:text-sm" style={{ fontFamily: "var(--font-sf-rounded)" }}>
                    {Math.round(project.progress_percentage || 0)}%
                  </span>
                </div>

                <ProjectProgress value={project.progress_percentage || 0} />
              </CardContent>
            </Link>
          </Card>
        )
      })}
    </div>
  )
})
