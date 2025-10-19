// This file contains utilities that are safe to use in client components
import type { Project } from "@/lib/types"

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`
  }
  return `$${amount.toFixed(0)}`
}

export function filterProjects(projects: Project[], searchTerm: string): Project[] {
  if (!searchTerm || searchTerm.trim() === "") {
    return projects
  }

  const term = searchTerm.toLowerCase().trim()

  return projects.filter((project) => {
    const name = project.name?.toLowerCase() || ""
    const description = project.description?.toLowerCase() || ""
    const category = project.category?.toLowerCase() || ""

    return name.includes(term) || description.includes(term) || category.includes(term)
  })
}

export function toNumberSafe(val: unknown): number {
  if (val == null) return 0;
  if (typeof val === "number") return Number.isFinite(val) ? val : 0;
  if (typeof val === "bigint") return Number(val);
  if (typeof val === "string") {
    // strip currency symbols/commas/spaces
    const n = Number(val.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  // Prisma.Decimal or similar
  // decimal.js has toNumber / toString
  const anyVal = val as any;
  if (anyVal?.toNumber && typeof anyVal.toNumber === "function") {
    const n = anyVal.toNumber();
    return Number.isFinite(n) ? n : 0;
  }
  if (anyVal?.toString && typeof anyVal.toString === "function") {
    const n = Number(anyVal.toString());
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}


export function sortProjects(projects: Project[], sortOrder: string): Project[] {
  const sorted = [...projects]
  switch (sortOrder) {
    case "oldest":
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    case "overdue":
      return sorted.sort((a, b) => {
        const aOverdue = new Date(a.end_date) < new Date()
        const bOverdue = new Date(b.end_date) < new Date()
        return bOverdue ? 1 : aOverdue ? -1 : 0
      })
    case "at-risk":
      return sorted.sort((a, b) => (b.progress_percentage || 0) - (a.progress_percentage || 0))
    default:
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
}

export function paginateItems<T>(items: T[], currentPage: number, itemsPerPage: number) {
  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = items.slice(startIndex, endIndex)

  return { currentItems, totalPages, startIndex, endIndex }
}
