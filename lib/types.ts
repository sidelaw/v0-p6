// Core domain types
export interface Project {  
  readonly id: number
  readonly name: string
  readonly description?: string | null
  readonly status: "active" | "completed" | "on-hold"
  readonly github_repo?: string | null
  readonly discord_channel?: string | null
  readonly creator_username?: string | null
  readonly assignee_discord_id?: string | null
  readonly funding_amount?: number | null
  readonly start_date?: string | null
  readonly end_date?: string | null
  readonly created_at: string
  readonly updated_at: string
  readonly total_milestones?: number
  readonly completed_milestones?: number
  readonly progress_percentage?: number
  readonly category?: string | null
  readonly duration?: string | null
  readonly grantee_email?: string | null
  readonly creator_name?: string
  readonly creator_email?: string
  readonly active_milestone_status?: string
}

export interface Milestone {
  readonly id: number
  readonly project_id: number
  readonly title: string
  readonly description?: string | null
  readonly due_date?: string | null
  readonly status: "pending" | "in-progress" | "completed" | "overdue" | "not-started"
  readonly budget_allocated?: number | null
  readonly completion_date?: string | null
  readonly created_at: string
  readonly updated_at: string
}

export interface User {
  readonly id: number
  readonly name: string
  readonly email: string
  readonly role: "admin" | "user"
  readonly created_at: string
}

export interface ActivityLog {
  readonly id: number
  readonly project_id: number
  readonly source: string
  readonly type: string
  readonly content?: string | null
  readonly url?: string | null
  readonly timestamp: string
}

// API response types
export interface ApiResponse<T> {
  readonly data?: T
  readonly error?: string
  readonly message?: string
}

export interface PaginatedResponse<T> {
  readonly data: readonly T[]
  readonly total: number
  readonly page: number
  readonly pageSize: number
  readonly totalPages: number
}

// Extended types for specific use cases
export interface ProjectWithMilestones extends Project {
  readonly milestones: readonly Milestone[]
}

export interface ProjectWithDetails extends Project {
  readonly milestones: readonly Milestone[]
  readonly recent_activity: readonly ActivityLog[]
}

export interface DashboardStats {
  readonly totalProjects: number
  readonly activeProjects: number
  readonly completedProjects: number
  readonly totalFunding: number
  readonly overdueMilestones: number
}

// Webhook types
export interface GitHubWebhookPayload {
  readonly action?: string
  readonly commits?: Array<{
    readonly message: string
    readonly url: string
  }>
  readonly head_commit?: {
    readonly timestamp: string
  }
  readonly pull_request?: {
    readonly title: string
    readonly html_url: string
    readonly created_at: string
  }
  readonly issue?: {
    readonly title: string
    readonly html_url: string
    readonly created_at: string
  }
}

export interface DiscordWebhookPayload {
  readonly content: string
  readonly author: {
    readonly username: string
    readonly id: string
  }
  readonly channel_id: string
  readonly guild_id?: string
  readonly id: string
  readonly timestamp?: string
}
