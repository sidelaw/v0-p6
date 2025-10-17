"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatCompactCurrency } from "@/lib/client-utils"
import type { Project } from "@/lib/types"

interface StatsCardsProps {
  projects: Project[]
}

export function StatsCards({ projects }: StatsCardsProps) {
  const totalFunds = projects.reduce((sum, project) => {
    const amount = project.funding_amount
    // Convert to number and handle null/undefined/NaN cases
    const numericAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0
    return sum + numericAmount
  }, 0)

  console.log("[v0] Total Funds Calculation:", {
    projectCount: projects.length,
    totalFunds,
    fundingAmounts: projects.map((p) => ({ id: p.id, name: p.name, amount: p.funding_amount })),
  })

  const activeProjects = projects.filter((p) => p.status.toLowerCase() === "active").length

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-6 mb-6 md:mb-8 mt-6">
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-[var(--wui-border-radius-m)]">
        <CardContent className="p-2 md:p-6 text-center">
          <h3 className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2 font-sf-rounded">Total Funds</h3>
          <p className="text-lg md:text-3xl font-bold text-white font-sf-rounded">
            {formatCompactCurrency(totalFunds)}
          </p>
        </CardContent>
      </Card>
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-[var(--wui-border-radius-m)]">
        <CardContent className="p-2 md:p-6 text-center">
          <h3 className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2 font-sf-rounded">Total Projects</h3>
          <p className="text-lg md:text-3xl font-bold text-white font-sf-rounded">{projects.length}</p>
        </CardContent>
      </Card>
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-[var(--wui-border-radius-m)]">
        <CardContent className="p-2 md:p-6 text-center">
          <h3 className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2 font-sf-rounded">Active Projects</h3>
          <p className="text-lg md:text-3xl font-bold text-white font-sf-rounded">{activeProjects}</p>
        </CardContent>
      </Card>
    </div>
  )
}
