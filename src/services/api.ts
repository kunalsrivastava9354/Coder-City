export type PlatformType = 'leetcode' | 'github'

export interface SubmissionCell {
  x: number // Week index: 0..52
  z: number // Day of week index: 0 (Sun) .. 6 (Sat)
  count: number // Problems solved / commits count
  date: string // YYYY-MM-DD
  dayOfWeek: number // 0-6
  tier: 'empty' | 'small' | 'medium' | 'skyscraper' | 'megatower'
  breakdown?: {
    easy: number
    medium: number
    hard: number
  }
}

export interface CityUserData {
  platform: PlatformType
  username: string
  displayName?: string
  avatar?: string
  totalSubmissions: number
  currentStreak: number
  longestStreak: number
  grid: SubmissionCell[]
  isMock: boolean
  leetcodeStats?: {
    easySolved: number
    mediumSolved: number
    hardSolved: number
    totalSolved: number
    acceptanceRate?: string
    ranking?: number
    reputation?: number
  }
  githubStats?: {
    totalContributions: number
  }
}

/**
 * Classify daily solve/commit count into 3D building architectural tiers.
 */
export function getBuildingTier(count: number): 'empty' | 'small' | 'medium' | 'skyscraper' | 'megatower' {
  if (count <= 0) return 'empty'
  if (count <= 2) return 'small'
  if (count <= 5) return 'medium'
  if (count <= 9) return 'skyscraper'
  return 'megatower'
}

/**
 * Calculates current and longest active streaks.
 */
export function calculateStreaks(days: { date: string; count: number }[]): {
  currentStreak: number
  longestStreak: number
} {
  let longestStreak = 0
  let tempStreak = 0

  for (let i = 0; i < days.length; i++) {
    if (days[i].count > 0) {
      tempStreak++
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
    } else {
      tempStreak = 0
    }
  }

  // Current streak (active if solved today or yesterday)
  let currentStreak = 0
  const hasRecent = days.slice(-2).some((d) => d.count > 0)

  if (hasRecent) {
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        currentStreak++
      } else if (currentStreak > 0) {
        break
      }
    }
  }

  return { currentStreak, longestStreak }
}

/**
 * Generate rich, realistic daily submission/commit data for demo/sandbox usage.
 */
export function generateMockData(username: string, platform: PlatformType): CityUserData {
  const days: { date: string; count: number; dayOfWeek: number }[] = []
  const today = new Date()

  // Go back 370 days (53 weeks = 371 days)
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 370)

  // Align to Sunday
  const dayOfWeek = startDate.getDay()
  if (dayOfWeek > 0) {
    startDate.setDate(startDate.getDate() - dayOfWeek)
  }

  let totalCount = 0
  let totalEasy = 0
  let totalMedium = 0
  let totalHard = 0

  for (let i = 0; i < 371; i++) {
    const curDate = new Date(startDate)
    curDate.setDate(startDate.getDate() + i)
    const dateStr = curDate.toISOString().split('T')[0]
    const dow = curDate.getDay()

    // Create organic activity waves (e.g. contest days on weekends, sprints, exams/holidays)
    const wave = Math.sin(i * 0.045) + Math.cos(i * 0.11) + Math.sin(i * 0.02) * 0.5
    let count = 0

    if (wave > -0.25) {
      const rand = Math.random()
      // Weekend contest boost
      const isWeekend = dow === 0 || dow === 6
      const boost = isWeekend ? 1.4 : 1.0

      if (rand * boost > 0.82) {
        count = Math.floor(Math.random() * 8) + 6 // Heavy sprint / contest day: 6-13 solves
      } else if (rand * boost > 0.35) {
        count = Math.floor(Math.random() * 4) + 1 // Normal practice day: 1-4 solves
      }
    }

    if (count > 0) {
      totalCount += count
      // Distribute difficulties roughly: 45% Easy, 40% Medium, 15% Hard
      const hard = Math.floor(count * 0.15)
      const medium = Math.floor(count * 0.45)
      const easy = count - hard - medium
      totalEasy += easy
      totalMedium += medium
      totalHard += hard
    }

    days.push({
      date: dateStr,
      count,
      dayOfWeek: dow,
    })
  }

  const { currentStreak, longestStreak } = calculateStreaks(days)

  const grid: SubmissionCell[] = days.map((d, idx) => {
    const hard = Math.floor(d.count * 0.15)
    const medium = Math.floor(d.count * 0.45)
    const easy = d.count - hard - medium
    return {
      x: Math.floor(idx / 7),
      z: idx % 7,
      count: d.count,
      date: d.date,
      dayOfWeek: d.dayOfWeek,
      tier: getBuildingTier(d.count),
      breakdown:
        d.count > 0
          ? {
              easy,
              medium,
              hard,
            }
          : undefined,
    }
  })

  return {
    platform,
    username: username || (platform === 'leetcode' ? 'LeetCodeMaster' : 'CodeArchitect'),
    displayName: username || (platform === 'leetcode' ? 'Algorithm Champion' : 'OpenSource Hero'),
    totalSubmissions: totalCount,
    currentStreak,
    longestStreak,
    grid,
    isMock: true,
    leetcodeStats:
      platform === 'leetcode'
        ? {
            easySolved: totalEasy,
            mediumSolved: totalMedium,
            hardSolved: totalHard,
            totalSolved: totalCount,
            acceptanceRate: '68.4%',
            ranking: 18452,
            reputation: 342,
          }
        : undefined,
    githubStats:
      platform === 'github'
        ? {
            totalContributions: totalCount,
          }
        : undefined,
  }
}

/**
 * Fetch live data from backend proxy, falling back to mock when offline or in demo mode.
 */
export async function fetchCityData(
  username: string,
  platform: PlatformType,
  mode: 'real' | 'demo'
): Promise<CityUserData> {
  if (mode === 'demo') {
    return generateMockData(username, platform)
  }

  const endpoint = platform === 'leetcode' ? `/api/leetcode/${encodeURIComponent(username)}` : `/api/github/${encodeURIComponent(username)}`

  try {
    const res = await fetch(endpoint)
    if (!res.ok) {
      let errMsg = `Server returned status ${res.status}`
      try {
        const errJson = await res.json()
        if (errJson && errJson.error) {
          errMsg = errJson.error
        }
      } catch {
        // use fallback message
      }
      throw new Error(errMsg)
    }

    const data: CityUserData = await res.json()
    return data
  } catch (error: any) {
    console.warn(`Live ${platform} fetch failed:`, error.message)
    throw error
  }
}
