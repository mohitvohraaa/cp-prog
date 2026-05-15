import { Problem, Ladder } from './types'
import { generateId } from './utils'

export function parseA2OJMarkdownTable(md: string): Ladder | null {
  const lines = md.split('\n').filter(l => l.trim())
  
  let name = 'Untitled Ladder'
  let description = ''
  const problems: Problem[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (line.startsWith('# ')) {
      name = line.replace(/^#\s*Ladder Name:\s*/, '').trim()
    } else if (line.startsWith('## Description')) {
      if (i + 1 < lines.length && !lines[i + 1].startsWith('|')) {
        description = lines[i + 1].trim()
      }
    } else if (line.startsWith('|') && line.includes('Problem Name') && line.includes('Online Judge')) {
      // Header row - skip
      i++ // skip separator row too
      continue
    } else if (line.startsWith('|---')) {
      continue
    } else if (line.startsWith('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(Boolean)
      if (parts.length >= 5) {
        const checkbox = parts[0]
        const index = parseInt(parts[1], 10)
        const nameMatch = parts[2].match(/\[(.*?)\]\((.*?)\)/)
        const problemName = nameMatch ? nameMatch[1] : parts[2]
        const url = nameMatch ? nameMatch[2] : ''
        const judge = parts[3]
        const difficulty = parseInt(parts[4], 10) || 1
        
        if (!isNaN(index) && problemName && url) {
          problems.push({
            id: generateId(),
            index,
            name: problemName,
            url,
            difficulty,
            tags: inferTags(problemName),
            ladderId: '', // filled later
            solvedAt: checkbox.includes('[x]') ? new Date().toISOString() : null,
            notes: '',
            bookmarked: false,
            timeSpent: 0,
          })
        }
      }
    }
  }
  
  if (problems.length === 0) return null
  
  const ladder: Ladder = {
    id: generateId(),
    name,
    description,
    problems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  ladder.problems.forEach(p => p.ladderId = ladder.id)
  
  return ladder
}

export function inferTags(problemName: string): string[] {
  const name = problemName.toLowerCase()
  const tags: string[] = []
  
  const tagMap: Record<string, string[]> = {
    'implementation': ['matrix', 'table', 'array', 'string', 'sort', 'queue', 'simulation', 'implementation'],
    'math': ['number', 'prime', 'divisor', 'equation', 'fibonacci', 'hexadecimal', 'permutation', 'combinatorics', 'probability', 'geometry', 'pythagorean', 'math', 'arithmetic', 'lucky'],
    'strings': ['word', 'capitalization', 'translation', 'string', 'text', 'palindrome', 'anagram', 'subsequence', 'substring', 'prefix', 'suffix'],
    'greedy': ['greedy', 'optimal', 'maximum', 'minimum', 'schedule', 'activity'],
    'binary search': ['binary', 'search', 'lower_bound', 'upper_bound', 'bisect'],
    'dfs and similar': ['dfs', 'bfs', 'graph', 'tree', 'connected', 'component', 'path', 'cycle'],
    'data structures': ['set', 'map', 'hash', 'stack', 'heap', 'segment', 'fenwick', 'tree', 'queue'],
    'dp': ['dp', 'dynamic', 'memoization', 'knapsack', 'lis', 'lcs'],
    'two pointers': ['two pointers', 'sliding window', 'subarray'],
    'bitmasks': ['bit', 'xor', 'and', 'or', 'mask'],
    'number theory': ['gcd', 'lcm', 'modular', 'inverse', 'factorial', 'sieve'],
    'sortings': ['sort', 'order', 'rearrange', 'permute'],
    'games': ['game', 'play', 'move', 'win', 'lose', 'strategy', 'nim'],
    'brute force': ['brute', 'force', 'enumerate', 'check all'],
    'constructive algorithms': ['construct', 'build', 'make', 'create', 'form'],
  }
  
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some(k => name.includes(k))) {
      tags.push(tag)
    }
  }
  
  return tags.length > 0 ? tags : ['implementation']
}

export function parseJSON(jsonStr: string): Ladder | null {
  try {
    const data = JSON.parse(jsonStr)
    if (Array.isArray(data)) {
      return arrayToLadder(data)
    }
    if (data.problems) {
      return objectToLadder(data)
    }
    return null
  } catch {
    return null
  }
}

export function parseCSV(csvStr: string): Ladder | null {
  const lines = csvStr.split('\n').filter(l => l.trim())
  if (lines.length < 2) return null
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const problems: Problem[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => obj[h] = values[idx] || '')
    
    const index = parseInt(obj.id || obj.index || obj.number || '0', 10)
    const name = obj.name || obj.title || obj.problem || ''
    const url = obj.url || obj.link || obj.href || ''
    const difficulty = parseInt(obj.difficulty || obj.rating || '1', 10)
    
    if (index && name) {
      problems.push({
        id: generateId(),
        index,
        name,
        url,
        difficulty,
        tags: inferTags(name),
        ladderId: '',
        solvedAt: null,
        notes: '',
        bookmarked: false,
        timeSpent: 0,
      })
    }
  }
  
  if (problems.length === 0) return null
  
  const ladder: Ladder = {
    id: generateId(),
    name: 'Imported Ladder',
    description: 'Imported from CSV',
    problems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  ladder.problems.forEach(p => p.ladderId = ladder.id)
  return ladder
}

function arrayToLadder(arr: any[]): Ladder {
  const problems = arr.map((item, idx) => ({
    id: generateId(),
    index: item.index || item.id || idx + 1,
    name: item.name || item.title || 'Unknown',
    url: item.url || item.link || '',
    difficulty: item.difficulty || item.rating || 1,
    tags: inferTags(item.name || ''),
    ladderId: '',
    solvedAt: item.solved ? new Date().toISOString() : null,
    notes: item.notes || '',
    bookmarked: item.bookmarked || false,
    timeSpent: item.timeSpent || 0,
  }))
  
  const ladder: Ladder = {
    id: generateId(),
    name: 'Imported Ladder',
    description: 'Imported from JSON',
    problems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  ladder.problems.forEach(p => p.ladderId = ladder.id)
  return ladder
}

function objectToLadder(data: any): Ladder {
  const ladder = arrayToLadder(data.problems)
  ladder.name = data.name || ladder.name
  ladder.description = data.description || ladder.description
  return ladder
}
