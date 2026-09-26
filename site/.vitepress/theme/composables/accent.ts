import type { ProjectSummary } from '../node/projects'

// Inline CSS variables that give a project page or card its accent (see .utk-accent in styles/vars.css).
// They are part of the prerendered HTML, so the colors are right before any script runs.
export function accentStyle(project: Pick<ProjectSummary, 'accent' | 'accentLight' | 'accentDark'>) {
  return {
    '--p-raw': project.accent,
    '--p-light': project.accentLight,
    '--p-dark': project.accentDark,
  }
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
