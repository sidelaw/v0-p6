"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { ProjectProgress } from "@/components/ui/project-progress"
import { Table as ShadcnTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCompactCurrency, capitalizeStatus } from "@/lib/utils"
import { Project } from "@/lib/types"

interface ProjectTableProps {
  projects: Project[]
}

export const ProjectTable = React.memo(function ProjectTable({ projects }: ProjectTableProps) {
  const router = useRouter()

  return (
    <div className="overflow-x-auto">
      <div
        className="border border-border/50 overflow-hidden bg-card/80 backdrop-blur-sm min-w-[800px]"
        style={{ borderRadius: "var(--wui-border-radius-s)" }}
      >
        <ShadcnTable>
          <TableHeader>
            <TableRow className="border-border bg-card">
              <TableHead className="text-muted-foreground">Project Name</TableHead>
              <TableHead className="text-muted-foreground">Creator</TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-muted-foreground">Funding</TableHead>
              <TableHead className="text-muted-foreground">Duration</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow
                key={project.id}
                className="border-border hover:bg-card/50 transition-colors duration-300 cursor-pointer"
                onClick={() => router.push(`/individual-project?id=${project.id}`)}
              >
                <TableCell className="font-medium text-white hover:underline max-w-[200px]">
                  <div className="line-clamp-2" title={project.name}>
                    {project.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[150px]">
                  <div className="line-clamp-2" title={project.creator_username || "N/A"}>
                    {project.creator_username || "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-border text-muted-foreground transition-all duration-300">
                    {capitalizeStatus(project.category || "General")}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {project.funding_amount ? formatCompactCurrency(project.funding_amount) : "N/A"}
                </TableCell>
                <TableCell className="text-muted-foreground">{project.duration || "TBD"}</TableCell>
                <TableCell>
                  <StatusBadge status={project.status} />
                </TableCell>
                <TableCell>
                  <ProjectProgress value={project.progress_percentage || 0} showPercentage />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ShadcnTable>
      </div>
    </div>
  )
})
