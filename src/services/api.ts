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
 * Builds standard 371-day grid (53 weeks * 7 days) from a date-to-count map
 */
export function build371DayGrid(
  dateMap: Record<string, number>,
  difficultyRatios = { easy: 0.5, medium: 0.35, hard: 0.15 }
): {
  grid: SubmissionCell[]
  currentStreak: number
  longestStreak: number
} {
  const days: { date: string; count: number; dayOfWeek: number }[] = []
  const today = new Date()

  // 370 days back to cover 53 weeks (371 days)
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 370)

  const dow = startDate.getDay()
  if (dow > 0) {
    startDate.setDate(startDate.getDate() - dow)
  }

  for (let i = 0; i < 371; i++) {
    const curDate = new Date(startDate)
    curDate.setDate(startDate.getDate() + i)
    const dateStr = curDate.toISOString().split('T')[0]
    const count = dateMap[dateStr] || 0

    days.push({
      date: dateStr,
      count,
      dayOfWeek: curDate.getDay(),
    })
  }

  const { currentStreak, longestStreak } = calculateStreaks(days)

  const grid: SubmissionCell[] = days.map((d, idx) => {
    const hard = Math.floor(d.count * difficultyRatios.hard)
    const medium = Math.floor(d.count * difficultyRatios.medium)
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

  return { grid, currentStreak, longestStreak }
}

/**
 * Generate rich, realistic daily submission/commit data for demo/sandbox usage.
 */
export function generateMockData(username: string, platform: PlatformType): CityUserData {
  const days: { date: string; count: number; dayOfWeek: number }[] = []
  const today = new Date()

  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 370)

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

    const wave = Math.sin(i * 0.045) + Math.cos(i * 0.11) + Math.sin(i * 0.02) * 0.5
    let count = 0

    if (wave > -0.25) {
      const rand = Math.random()
      const isWeekend = dow === 0 || dow === 6
      const boost = isWeekend ? 1.4 : 1.0

      if (rand * boost > 0.82) {
        count = Math.floor(Math.random() * 8) + 6
      } else if (rand * boost > 0.35) {
        count = Math.floor(Math.random() * 4) + 1
      }
    }

    if (count > 0) {
      totalCount += count
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
 * Client-side direct fallback for LeetCode using public mirrors
 */
async function fetchLeetCodeClientDirect(username: string): Promise<CityUserData> {
  const mirrors = [
    `https://alfa-leetcode-api.onrender.com/userProfile/${encodeURIComponent(username)}`,
    `https://leetcode-api-faisalshohag.vercel.app/${encodeURIComponent(username)}`,
  ]

  for (const url of mirrors) {
    try {
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data && (data.totalSolved !== undefined || data.submissionCalendar)) {
          let dateMap: Record<string, number> = {}
          let totalSubmissions = 0
          let cal = data.submissionCalendar

          if (typeof cal === 'string') {
            try {
              cal = JSON.parse(cal)
            } catch {}
          }

          if (cal && typeof cal === 'object') {
            for (const [timestamp, count] of Object.entries(cal)) {
              const date = new Date(parseInt(timestamp, 10) * 1000).toISOString().split('T')[0]
              dateMap[date] = (dateMap[date] || 0) + Number(count)
              totalSubmissions += Number(count)
            }
          }

          const easySolved = data.easySolved || 0
          const mediumSolved = data.mediumSolved || 0
          const hardSolved = data.hardSolved || 0
          const totalSolved = data.totalSolved || easySolved + mediumSolved + hardSolved

          const easyRatio = totalSolved > 0 ? easySolved / totalSolved : 0.5
          const mediumRatio = totalSolved > 0 ? mediumSolved / totalSolved : 0.35
          const hardRatio = totalSolved > 0 ? hardSolved / totalSolved : 0.15

          const { grid, currentStreak, longestStreak } = build371DayGrid(dateMap, {
            easy: easyRatio,
            medium: mediumRatio,
            hard: hardRatio,
          })

          return {
            platform: 'leetcode',
            username,
            displayName: username,
            totalSubmissions: totalSubmissions || totalSolved,
            currentStreak,
            longestStreak,
            grid,
            isMock: false,
            leetcodeStats: {
              easySolved,
              mediumSolved,
              hardSolved,
              totalSolved,
              ranking: data.ranking || 0,
              reputation: data.reputation || 0,
            },
          }
        }
      } else if (res.status === 404) {
        throw new Error(`LeetCode user "${username}" not found.`)
      }
    } catch (err: any) {
      if (err.message && err.message.includes('not found')) throw err
      console.warn(`Mirror ${url} failed:`, err.message)
    }
  }

  throw new Error(`Could not retrieve LeetCode stats for "${username}". Please check the username or use Simulated Demo mode.`)
}

/**
 * Client-side direct fallback for GitHub contributions
 */
async function fetchGitHubClientDirect(username: string): Promise<CityUserData> {
  try {
    const pubRes = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`
    )

    if (pubRes.ok) {
      const pubData = await pubRes.json()
      if (pubData && pubData.contributions && Array.isArray(pubData.contributions)) {
        const dateMap: Record<string, number> = {}
        pubData.contributions.forEach((c: { date: string; count: number }) => {
          dateMap[c.date] = c.count
        })

        const { grid, currentStreak, longestStreak } = build371DayGrid(dateMap)
        const totalContributions =
          pubData.total?.lastYear ?? Object.values(dateMap).reduce((a, b) => a + b, 0)

        return {
          platform: 'github',
          username,
          displayName: username,
          totalSubmissions: totalContributions,
          currentStreak,
          longestStreak,
          grid,
          isMock: false,
          githubStats: {
            totalContributions,
          },
        }
      }
    } else if (pubRes.status === 400 || pubRes.status === 404) {
      throw new Error(`GitHub user "${username}" not found.`)
    }
  } catch (err: any) {
    if (err.message && err.message.includes('not found')) throw err
    console.warn('Direct GitHub fetch failed:', err.message)
  }

  throw new Error(`Could not retrieve GitHub contributions for "${username}". Please check the username or use Simulated Demo mode.`)
}

/**
 * Fetch live city data.
 * Tries local/Vercel backend proxy first; falls back seamlessly to direct public mirrors on error.
 */
export async function fetchCityData(
  username: string,
  platform: PlatformType,
  mode: 'real' | 'demo'
): Promise<CityUserData> {
  if (mode === 'demo') {
    return generateMockData(username, platform)
  }

  const cleanUser = username.trim()
  if (!cleanUser) {
    throw new Error(`Please enter a valid ${platform === 'leetcode' ? 'LeetCode' : 'GitHub'} username.`)
  }

  const endpoint =
    platform === 'leetcode'
      ? `/api/leetcode/${encodeURIComponent(cleanUser)}`
      : `/api/github/${encodeURIComponent(cleanUser)}`

  // 1. Try backend server / Vercel serverless function
  try {
    const res = await fetch(endpoint)
    if (res.ok) {
      const data: CityUserData = await res.json()
      return data
    }

    if (res.status === 404) {
      try {
        const errJson = await res.json()
        if (errJson && errJson.error && errJson.error.toLowerCase().includes('not found')) {
          throw new Error(errJson.error)
        }
      } catch (parseErr: any) {
        if (parseErr.message && parseErr.message.toLowerCase().includes('not found')) {
          throw parseErr
        }
      }
    }
    console.warn(`Backend endpoint ${endpoint} returned status ${res.status}. Trying client-side fallback...`)
  } catch (err: any) {
    if (err.message && err.message.toLowerCase().includes('not found')) {
      throw err
    }
    console.warn(`Primary ${platform} fetch failed (${err.message}). Trying client-side fallback...`)
  }

  // 2. Client-side fallback to direct public mirrors
  if (platform === 'leetcode') {
    return await fetchLeetCodeClientDirect(cleanUser)
  } else {
    return await fetchGitHubClientDirect(cleanUser)
  }
}
