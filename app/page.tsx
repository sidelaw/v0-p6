"use client"
import { LayoutGrid, List, Star } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import Link from "next/link"
import { sortProjects, paginateItems, filterProjects } from "@/lib/client-utils"
import { useProjects } from "@/hooks/use-projects"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ErrorState } from "@/components/dashboard/error-state"
import { ProjectGrid } from "@/components/dashboard/project-grid"
import { ProjectTable } from "@/components/dashboard/project-table"
import { RecentUpdates } from "@/components/dashboard/recent-updates"
import { ErrorBoundary } from "@/components/error-boundary"
import { ProjectGridSkeleton, StatsCardSkeleton } from "@/components/dashboard/skeleton-loader"
import { ITEMS_PER_PAGE_DESKTOP } from "@/lib/constants"
import { cn } from "@/lib/utils"

function DashboardContent() {
  const { projects, isLoading, error, refetch } = useProjects()
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState("new")

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchTerm = searchParams.get("search") || ""

  const filteredProjects = useMemo(() => filterProjects(projects, searchTerm), [projects, searchTerm])

  const sortedProjects = useMemo(() => sortProjects(filteredProjects, sortOrder), [filteredProjects, sortOrder])

  const paginationData = useMemo(
    () => paginateItems(sortedProjects, currentPage, ITEMS_PER_PAGE_DESKTOP),
    [sortedProjects, currentPage],
  )

  const { currentItems: currentPrograms, totalPages, startIndex, endIndex } = paginationData

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-0">
        {/* Stats Cards with skeleton loading */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 mt-6">
            {[...Array(3)].map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <StatsCards projects={projects} />
        )}

        {/* Header Section */}
        <div className="mb-6 md:mb-8 -mx-4 md:-mx-8 px-4 md:px-8 py-4 md:py-6 backdrop-blur-xl bg-background/80 border-b border-white/10">
          <div className="hidden md:block">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2 text-primary">
              <Star className="w-5 h-5 md:w-6 md:h-6 fill-primary" aria-hidden="true" />
              <span className="text-lg md:text-xl font-bold text-foreground">Check out the newest grant programs!</span>
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm lg:text-base mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true"></span>
              <span>
                {filteredProjects.length} projects found{searchTerm && ` (filtered from ${projects.length})`}
              </span>
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Programs Section */}
          <main className="flex-1 w-full">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-foreground">Programs</h2>
                <div className="flex items-center gap-2">
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger
                      className="w-[100px] md:w-[120px] bg-card/80 backdrop-blur-sm border-border/50 text-muted-foreground text-xs md:text-sm"
                      aria-label="Sort projects by"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card/95 backdrop-blur-xl text-foreground border-border/50">
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="at-risk">At Risk</SelectItem>
                      <SelectItem value="not-started">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    className={cn(
                      "border-border text-muted-foreground w-8 h-8 md:w-10 md:h-10 hover:bg-primary hover:text-white hover:border-primary transition-colors",
                      viewMode === "grid" && "bg-card/80 backdrop-blur-sm",
                    )}
                    onClick={() => setViewMode("grid")}
                    aria-label="Switch to grid view"
                    aria-pressed={viewMode === "grid"}
                  >
                    <LayoutGrid className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  <Button
                    className={cn(
                      "border-border text-muted-foreground w-8 h-8 md:w-10 md:h-10 hover:bg-primary hover:text-white hover:border-primary transition-colors",
                      viewMode === "table" && "bg-primary text-white border-primary",
                    )}
                    onClick={() => setViewMode("table")}
                    aria-label="Switch to table view"
                    aria-pressed={viewMode === "table"}
                  >
                    <List className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </div>

              {/* Projects with skeleton loading */}
              {isLoading ? (
                <ProjectGridSkeleton />
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  {searchTerm ? (
                    <>
                      <p className="text-muted-foreground mb-4">No projects found matching "{searchTerm}"</p>
                      <Button onClick={() => router.push(pathname)} className="bg-primary hover:bg-primary/90">
                        Clear Search
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground mb-4">No projects found. Create your first project!</p>
                      <Link href="/admin/projects/new">
                        <Button className="bg-primary hover:bg-primary/90">Create Project</Button>
                      </Link>
                    </>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <ProjectGrid projects={currentPrograms} />
              ) : (
                <ProjectTable projects={currentPrograms} />
              )}
            </div>

            {filteredProjects.length > 0 && (
              <nav className="flex justify-center mb-6" aria-label="Pagination">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <button
                        onClick={() => {
                          if (currentPage > 1) setCurrentPage(currentPage - 1)
                        }}
                        disabled={currentPage === 1}
                        className={cn(
                          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10",
                          currentPage === 1 && "pointer-events-none opacity-50",
                        )}
                        aria-label="Go to previous page"
                      >
                        <span>Previous</span>
                      </button>
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 w-10",
                            currentPage === page
                              ? "bg-primary text-primary-foreground"
                              : "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                          )}
                          aria-label={`Go to page ${page}`}
                          aria-current={currentPage === page ? "page" : undefined}
                        >
                          {page}
                        </button>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <button
                        onClick={() => {
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                        }}
                        disabled={currentPage === totalPages}
                        className={cn(
                          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10",
                          currentPage === totalPages && "pointer-events-none opacity-50",
                        )}
                        aria-label="Go to next page"
                      >
                        <span>Next</span>
                      </button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </nav>
            )}

            <div className="mb-12 text-center">
              <p className="text-muted-foreground text-xs md:text-sm">
                {filteredProjects.length > 0
                  ? `Showing ${startIndex + 1}-${Math.min(endIndex, sortedProjects.length)} of ${sortedProjects.length} grants`
                  : "No grants to display"}
              </p>
            </div>
          </main>

          <RecentUpdates />
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  )
}
