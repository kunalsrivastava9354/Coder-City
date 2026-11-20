import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// In-memory cache for API responses (10 minutes TTL)
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getGithubToken() {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim().length > 0) {
    return process.env.GITHUB_TOKEN.trim();
  }
  try {
    const token = execSync('gh auth token', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (token) return token;
  } catch {}
  return null;
}

function getBuildingTier(count) {
  if (count <= 0) return 'empty';
  if (count <= 2) return 'small';
  if (count <= 5) return 'medium';
  if (count <= 9) return 'skyscraper';
  return 'megatower';
}

function calculateStreaks(days) {
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < days.length; i++) {
    if (days[i].count > 0) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  let currentStreak = 0;
  const hasRecent = days.slice(-2).some((d) => d.count > 0);
  if (hasRecent) {
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        currentStreak++;
      } else if (currentStreak > 0) {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Generate 371 days (53 weeks * 7 days) ending today, aligned to Sunday
 */
function build371DayGrid(dateMap, defaultDifficultyRatios = { easy: 0.5, medium: 0.35, hard: 0.15 }) {
  const days = [];
  const today = new Date();

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 370);
  const dow = startDate.getDay();
  if (dow > 0) {
    startDate.setDate(startDate.getDate() - dow);
  }

  for (let i = 0; i < 371; i++) {
    const cur = new Date(startDate);
    cur.setDate(startDate.getDate() + i);
    const dateStr = cur.toISOString().split('T')[0];
    const count = dateMap[dateStr] || 0;

    days.push({
      date: dateStr,
      count,
      dayOfWeek: cur.getDay(),
    });
  }

  const { currentStreak, longestStreak } = calculateStreaks(days);

  const grid = days.map((d, idx) => {
    const hard = Math.floor(d.count * defaultDifficultyRatios.hard);
    const medium = Math.floor(d.count * defaultDifficultyRatios.medium);
    const easy = d.count > 0 ? d.count - hard - medium : 0;

    return {
      x: Math.floor(idx / 7),
      z: idx % 7,
      count: d.count,
      date: d.date,
      dayOfWeek: d.dayOfWeek,
      tier: getBuildingTier(d.count),
      breakdown: d.count > 0 ? { easy, medium, hard } : undefined,
    };
  });

  return { grid, currentStreak, longestStreak };
}

// ==========================================
// 1. LEETCODE SUBMISSIONS ENDPOINT
// ==========================================
app.get('/api/leetcode/:username', async (req, res) => {
  const username = req.params.username.trim();
  if (!username) {
    return res.status(400).json({ error: 'LeetCode username is required.' });
  }

  const cacheKey = `leetcode:${username.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  const leetcodeGql = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          realName
          userAvatar
          ranking
          reputation
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        userCalendar {
          activeYears
          streak
          totalActiveDays
          submissionCalendar
        }
      }
    }
  `;

  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        query: leetcodeGql,
        variables: { username },
      }),
    });

    if (!response.ok) {
      throw new Error(`LeetCode GraphQL returned HTTP ${response.status}`);
    }

    const result = await response.json();

    if (result.errors && (!result.data || !result.data.matchedUser)) {
      return res.status(404).json({ error: `LeetCode user "${username}" not found.` });
    }

    const matchedUser = result.data?.matchedUser;
    if (!matchedUser) {
      return res.status(404).json({ error: `LeetCode user "${username}" not found.` });
    }

    // Extract calendar submission counts
    let dateMap = {};
    let totalSubmissions = 0;
    const calendarStr = matchedUser.userCalendar?.submissionCalendar;
    if (calendarStr) {
      try {
        const rawCalendar = JSON.parse(calendarStr);
        for (const [timestamp, count] of Object.entries(rawCalendar)) {
          const date = new Date(parseInt(timestamp, 10) * 1000).toISOString().split('T')[0];
          dateMap[date] = (dateMap[date] || 0) + Number(count);
          totalSubmissions += Number(count);
        }
      } catch (err) {
        console.error('Error parsing submissionCalendar JSON:', err);
      }
    }

    // Solve stats
    const stats = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    let totalSolved = 0;

    stats.forEach((s) => {
      if (s.difficulty === 'All') totalSolved = s.count;
      if (s.difficulty === 'Easy') easySolved = s.count;
      if (s.difficulty === 'Medium') mediumSolved = s.count;
      if (s.difficulty === 'Hard') hardSolved = s.count;
    });

    const easyRatio = totalSolved > 0 ? easySolved / totalSolved : 0.5;
    const mediumRatio = totalSolved > 0 ? mediumSolved / totalSolved : 0.35;
    const hardRatio = totalSolved > 0 ? hardSolved / totalSolved : 0.15;

    const { grid, currentStreak, longestStreak } = build371DayGrid(dateMap, {
      easy: easyRatio,
      medium: mediumRatio,
      hard: hardRatio,
    });

    const responseData = {
      platform: 'leetcode',
      username: matchedUser.username,
      displayName: matchedUser.profile?.realName || matchedUser.username,
      avatar: matchedUser.profile?.userAvatar,
      totalSubmissions: totalSubmissions || totalSolved,
      currentStreak: matchedUser.userCalendar?.streak || currentStreak,
      longestStreak: longestStreak,
      grid,
      isMock: false,
      leetcodeStats: {
        easySolved,
        mediumSolved,
        hardSolved,
        totalSolved,
        ranking: matchedUser.profile?.ranking || 0,
        reputation: matchedUser.profile?.reputation || 0,
      },
    };

    cache.set(cacheKey, { timestamp: Date.now(), data: responseData });
    return res.json(responseData);
  } catch (error) {
    console.error('LeetCode API error:', error.message);
    return res.status(500).json({
      error: `Could not retrieve live LeetCode stats for "${username}". (${error.message})`,
    });
  }
});

// ==========================================
// 2. GITHUB COMMITS ENDPOINT
// ==========================================
const githubGql = `
  query($login: String!) {
    user(login: $login) {
      name
      avatarUrl
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

app.get('/api/github/:username', async (req, res) => {
  const username = req.params.username.trim();
  if (!username) {
    return res.status(400).json({ error: 'GitHub username is required.' });
  }

  const cacheKey = `github:${username.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  // Only use cache if it was successful and had submissions
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS && cached.data.totalSubmissions > 0) {
    return res.json(cached.data);
  }

  const token = getGithubToken();

  // 1. Official GitHub GraphQL API if token is available
  if (token) {
    try {
      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'LeetCode-GitHub-City',
        },
        body: JSON.stringify({
          query: githubGql,
          variables: { login: username },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.errors) {
          const firstMsg = result.errors[0]?.message || '';
          if (firstMsg.includes('Could not resolve to a User')) {
            return res.status(404).json({ error: `GitHub user "${username}" not found.` });
          }
        }

        if (result.data?.user) {
          const user = result.data.user;
          const calendar = user.contributionsCollection?.contributionCalendar;
          if (calendar) {
            const dateMap = {};
            calendar.weeks.forEach((w) => {
              w.contributionDays.forEach((d) => {
                dateMap[d.date] = d.contributionCount;
              });
            });

            const { grid, currentStreak, longestStreak } = build371DayGrid(dateMap);
            const responseData = {
              platform: 'github',
              username,
              displayName: user.name || username,
              avatar: user.avatarUrl,
              totalSubmissions: calendar.totalContributions,
              currentStreak,
              longestStreak,
              grid,
              isMock: false,
              githubStats: {
                totalContributions: calendar.totalContributions,
              },
            };

            cache.set(cacheKey, { timestamp: Date.now(), data: responseData });
            return res.json(responseData);
          }
        }
      }
    } catch (err) {
      console.warn('GitHub GraphQL API failed, trying public contributions API...', err.message);
    }
  }

  // 2. High-performance public GitHub contributions API (No token required, works for any public user)
  try {
    const pubRes = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
      { headers: { 'User-Agent': 'LeetCode-GitHub-City' } }
    );

    if (pubRes.ok) {
      const pubData = await pubRes.json();
      if (pubData && pubData.contributions && Array.isArray(pubData.contributions)) {
        const dateMap = {};
        pubData.contributions.forEach((c) => {
          dateMap[c.date] = c.count;
        });

        const { grid, currentStreak, longestStreak } = build371DayGrid(dateMap);
        const totalContributions =
          pubData.total?.lastYear ?? Object.values(dateMap).reduce((a, b) => a + b, 0);

        const responseData = {
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
        };

        cache.set(cacheKey, { timestamp: Date.now(), data: responseData });
        return res.json(responseData);
      }
    } else if (pubRes.status === 400 || pubRes.status === 404) {
      return res.status(404).json({ error: `GitHub user "${username}" not found.` });
    }
  } catch (err) {
    console.warn('Public contributions API failed, trying HTML scraper...', err.message);
  }

  // 3. Fallback: Direct scraping of public github.com/users/:username/contributions
  try {
    const htmlRes = await fetch(
      `https://github.com/users/${encodeURIComponent(username)}/contributions`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      }
    );

    if (htmlRes.ok) {
      const html = await htmlRes.text();
      const dateMap = {};
      let totalContributions = 0;

      const dayMatches = html.matchAll(
        /data-date="(\d{4}-\d{2}-\d{2})"[^>]*>[\s\S]*?<tool-tip[^>]*>([^<]+)<\/tool-tip>/g
      );
      for (const m of dayMatches) {
        const date = m[1];
        const tip = m[2];
        const countMatch = tip.match(/(\d+)\s+contribution/);
        const count = countMatch ? parseInt(countMatch[1], 10) : 0;
        dateMap[date] = count;
        totalContributions += count;
      }

      if (Object.keys(dateMap).length > 0) {
        const { grid, currentStreak, longestStreak } = build371DayGrid(dateMap);
        const responseData = {
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
        };
        cache.set(cacheKey, { timestamp: Date.now(), data: responseData });
        return res.json(responseData);
      }
    } else if (htmlRes.status === 404) {
      return res.status(404).json({ error: `GitHub user "${username}" not found.` });
    }
  } catch (err) {
    console.warn('HTML scraper failed:', err.message);
  }

  return res.status(502).json({
    error: `Could not connect to GitHub to retrieve contributions for "${username}". Please verify the username or use Simulated Demo mode.`,
  });
});

// Production: Serve static client assets
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*any', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
