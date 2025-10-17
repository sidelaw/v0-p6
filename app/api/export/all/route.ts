// app/api/export/all/route.ts
import { NextResponse, type NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)

        const includeRaw = (searchParams.get("include") || "projects,milestones,activity_logs").toLowerCase()
        const includeProjects = includeRaw.includes("projects")
        const includeMilestones = includeRaw.includes("milestones")
        const includeActivity = includeRaw.includes("activity_logs")

        const since = searchParams.get("since") || null
        const nested = (searchParams.get("nested") || "").toLowerCase() === "true"

        const projectIdsParam = searchParams.get("project_ids")
        const projectIdWhitelist = projectIdsParam
            ? projectIdsParam
                .split(",")
                .map(s => Number.parseInt(s.trim(), 10))
                .filter(n => Number.isFinite(n))
            : null

        const projectLimit = toPositiveInt(searchParams.get("project_limit"))
        const milestonesLimit = toPositiveInt(searchParams.get("milestones_limit"))
        const activityLimit = toPositiveInt(searchParams.get("activity_limit"))

        // -------- Projects --------
        let projects: any[] = []
        if (includeProjects) {
            const whereProjects =
                projectIdWhitelist && projectIdWhitelist.length
                    ? sql`WHERE p.id = ANY(${projectIdWhitelist})`
                    : sql``

            const limitProjects = projectLimit ? sql`LIMIT ${projectLimit}` : sql``

            projects = await sql/*sql*/`
        SELECT
          p.*,
          COALESCE(tm.total_milestones, 0) as total_milestones,
          COALESCE(cm.completed_milestones, 0) as completed_milestones,
          CASE
            WHEN COALESCE(tm.total_milestones, 0) = 0 THEN 0
            ELSE ROUND( (COALESCE(cm.completed_milestones,0)::decimal / NULLIF(tm.total_milestones,0)) * 100 )
          END as progress_percentage,
          ams.active_milestone_status
        FROM projects p
        LEFT JOIN (
          SELECT project_id, COUNT(*) as total_milestones
          FROM milestones
          GROUP BY project_id
        ) tm ON tm.project_id = p.id
        LEFT JOIN (
          SELECT project_id, COUNT(*) as completed_milestones
          FROM milestones
          WHERE status = 'completed'
          GROUP BY project_id
        ) cm ON cm.project_id = p.id
        LEFT JOIN (
          SELECT DISTINCT ON (project_id)
            project_id,
            status as active_milestone_status
          FROM milestones
          WHERE status != 'completed'
          ORDER BY project_id, created_at DESC
        ) ams ON ams.project_id = p.id
        ${whereProjects}
        ORDER BY p.created_at DESC
        ${limitProjects}
      `
        }

        // which project ids to use for children
        let projectIdsForChildren: number[] | null = null
        if (projectIdWhitelist && projectIdWhitelist.length) {
            projectIdsForChildren = projectIdWhitelist
        } else if (includeProjects) {
            projectIdsForChildren = projects.map(p => p.id)
        }

        // -------- Milestones --------
        let milestones: any[] = []
        if (includeMilestones) {
            const hasPid = !!(projectIdsForChildren && projectIdsForChildren.length)
            const hasSince = !!since

            let whereMilestones = sql``
            if (hasPid && hasSince) {
                whereMilestones = sql`WHERE m.project_id = ANY(${projectIdsForChildren}) AND m.updated_at >= ${since}`
            } else if (hasPid) {
                whereMilestones = sql`WHERE m.project_id = ANY(${projectIdsForChildren})`
            } else if (hasSince) {
                whereMilestones = sql`WHERE m.updated_at >= ${since}`
            }

            const limitMilestones = milestonesLimit ? sql`LIMIT ${milestonesLimit}` : sql``

            milestones = await sql/*sql*/`
        SELECT m.*
        FROM milestones m
        ${whereMilestones}
        ORDER BY m.project_id ASC, m.ordinal ASC NULLS LAST, m.created_at ASC
        ${limitMilestones}
      `
        }

        // -------- Activity logs --------
        let activityLogs: any[] = []
        if (includeActivity) {
            const hasPid = !!(projectIdsForChildren && projectIdsForChildren.length)
            const hasSince = !!since

            let whereActivity = sql``
            if (hasPid && hasSince) {
                whereActivity = sql`WHERE a.project_id = ANY(${projectIdsForChildren}) AND a.timestamp >= ${since}`
            } else if (hasPid) {
                whereActivity = sql`WHERE a.project_id = ANY(${projectIdsForChildren})`
            } else if (hasSince) {
                whereActivity = sql`WHERE a.timestamp >= ${since}`
            }

            const limitActivity = activityLimit ? sql`LIMIT ${activityLimit}` : sql``

            activityLogs = await sql/*sql*/`
        SELECT a.*
        FROM activity_logs a
        ${whereActivity}
        ORDER BY a.timestamp DESC
        ${limitActivity}
      `
        }

        // -------- Shape response --------
        if (!nested) {
            return NextResponse.json({
                projects: includeProjects ? projects : [],
                milestones: includeMilestones ? milestones : [],
                activity_logs: includeActivity ? activityLogs : [],
            })
        }

        // nested = true
        const mByProject = new Map<number, any[]>()
        for (const m of milestones) {
            if (!mByProject.has(m.project_id)) mByProject.set(m.project_id, [])
            mByProject.get(m.project_id)!.push(m)
        }

        const aByProject = new Map<number, any[]>()
        for (const a of activityLogs) {
            if (!aByProject.has(a.project_id)) aByProject.set(a.project_id, [])
            aByProject.get(a.project_id)!.push(a)
        }

        let nestedProjects = projects
        if (!includeProjects && projectIdsForChildren && projectIdsForChildren.length) {
            nestedProjects = await sql/*sql*/`
        SELECT * FROM projects
        WHERE id = ANY(${projectIdsForChildren})
        ORDER BY created_at DESC
      `
        }

        const out = (nestedProjects || []).map((p: any) => ({
            project: p,
            milestones: includeMilestones ? (mByProject.get(p.id) || []) : [],
            activity_logs: includeActivity ? (aByProject.get(p.id) || []) : [],
        }))

        return NextResponse.json(out)
    } catch (err: any) {
        console.error("[export/all][GET] error:", err)
        return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
    }
}

function toPositiveInt(v: string | null): number | null {
    if (!v) return null
    const n = Number.parseInt(v, 10)
    return Number.isFinite(n) && n > 0 ? n : null
}
