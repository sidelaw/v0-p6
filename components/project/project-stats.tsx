import { Card, CardContent } from "@/components/ui/card"
import { getTimeLeft } from "@/lib/utils"
import type { Project } from "@/hooks/use-project"

interface ProjectStatsProps {
  project: Project
}

export function ProjectStats({ project }: ProjectStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card
        className="bg-card/80 backdrop-blur-sm border-border/50"
        style={{ borderRadius: "var(--wui-border-radius-m)" }}
      >
        <CardContent className="p-4 text-center">
          <h3 className="text-sm text-muted-foreground mb-1">Budget</h3>
          <p className="text-lg md:text-xl font-bold text-white">
            {project.funding_amount ? `$${Math.floor(project.funding_amount).toLocaleString("en-US")}` : "TBD"}
          </p>
        </CardContent>
      </Card>
      <Card
        className="bg-card/80 backdrop-blur-sm border-border/50"
        style={{ borderRadius: "var(--wui-border-radius-m)" }}
      >
        <CardContent className="p-4 text-center">
          <h3 className="text-sm text-muted-foreground mb-1">Time Left</h3>
          <p className="text-lg md:text-xl font-bold text-white">{getTimeLeft(project.end_date)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
