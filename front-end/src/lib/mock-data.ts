import type {
  Announcement,
  Assignment,
  Classroom,
  LeaderboardEntry,
  Problem,
  Submission,
  User,
} from '@/types'

export const mockUser: User = {
  id: 'u1',
  username: 'alex',
  name: 'Alex Chen',
  email: 'alex@school.edu',
  role: 'student',
  createdAt: '2025-01-15',
  xp: 2450,
  streak: 7,
  tier: 'Silver',
}

export const mockTeacher: User = {
  id: 't1',
  username: 'smith',
  name: 'Dr. Smith',
  email: 'smith@school.edu',
  role: 'teacher',
  createdAt: '2024-08-01',
}

export const mockProblems: Problem[] = [
  {
    id: 'p1',
    title: 'Sum of Two Numbers',
    statement:
      'Given two integers **a** and **b**, print their sum.\n\n## Input\nTwo integers on one line.\n\n## Output\nOne integer — the sum.',
    difficulty: 'easy',
    timeLimit: 1000,
    memoryLimit: 256,
    createdBy: 't1',
    tags: ['math', 'implementation'],
    solvedCount: 0,
  },
  {
    id: 'p2',
    title: 'Shortest Path in Graph',
    statement:
      'Find the shortest path from node 1 to node n in an unweighted graph.\n\nUse BFS.',
    difficulty: 'medium',
    timeLimit: 2000,
    memoryLimit: 512,
    createdBy: 't1',
    tags: ['graph', 'bfs'],
    solvedCount: 0,
  },
  {
    id: 'p3',
    title: 'DP on Trees',
    statement:
      'Given a tree with weighted edges, compute the maximum independent set.',
    difficulty: 'hard',
    timeLimit: 3000,
    memoryLimit: 512,
    createdBy: 't1',
    tags: ['dp', 'trees'],
    solvedCount: 0,
  },
]

export const mockClassrooms: Classroom[] = [
  {
    id: 'c1',
    name: 'CS301 — Algorithm Design',
    code: 'ALGO7X2',
    teacherId: 't1',
    studentCount: 42,
    description: 'Advanced algorithms and competitive programming.',
  },
  {
    id: 'c2',
    name: 'CS201 — Data Structures',
    code: 'DS4K9M',
    teacherId: 't1',
    studentCount: 38,
  },
]

export const mockSubmissions: Submission[] = [
  {
    id: 's1',
    userId: 'u1',
    problemId: 'p1',
    language: 'cpp',
    code: '#include <iostream>\nusing namespace std;\nint main() { int a,b; cin>>a>>b; cout<<a+b; }',
    verdict: 'Accepted',
    runtime: 12,
    memory: 1024,
    submittedAt: '2026-05-23T14:30:00Z',
    score: 100,
    testcaseResults: [
      { id: 'tc1', status: 'Accepted', time: 10, memory: 1024, isPublic: true },
      { id: 'tc2', status: 'Accepted', time: 12, memory: 1024, isPublic: true },
      { id: 'tc3', status: 'Accepted', time: 11, memory: 1024, isPublic: false },
    ],
  },
  {
    id: 's2',
    userId: 'u1',
    problemId: 'p2',
    language: 'python',
    code: 'def bfs(): pass',
    verdict: 'Wrong Answer',
    runtime: 45,
    memory: 8192,
    submittedAt: '2026-05-22T09:15:00Z',
    score: 60,
    testcaseResults: [
      { id: 'tc1', status: 'Accepted', time: 20, memory: 4096, isPublic: true },
      { id: 'tc2', status: 'Wrong Answer', time: 45, memory: 8192, isPublic: true },
      { id: 'tc3', status: 'Wrong Answer', isPublic: false },
    ],
  },
]

export const mockLeaderboard: LeaderboardEntry[] = []

export const mockAnnouncements: Announcement[] = [
  {
    id: 'a2',
    title: 'New problems added',
    body: 'Graph theory set is now available in the problemset.',
    classId: 'c1',
    createdAt: '2026-05-18T14:00:00Z',
  },
]

export const mockAssignments: Assignment[] = [
  {
    id: 'as1',
    title: 'Graph Theory Basics',
    className: 'CS301 Algorithm Design',
    dueAt: '2026-05-24T23:59:00Z',
    problemIds: ['p2'],
  },
  {
    id: 'as2',
    title: 'Dynamic Programming I',
    className: 'CS301 Algorithm Design',
    dueAt: '2026-05-25T23:59:00Z',
    problemIds: ['p3'],
  },
]

export const LANGUAGES = [
  { id: 'cpp', label: 'C++17', template: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n' },
  { id: 'python', label: 'Python 3', template: 'def main():\n    pass\n\nif __name__ == "__main__":\n    main()\n' },
  { id: 'java', label: 'Java', template: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n' },
  { id: 'javascript', label: 'Node.js', template: 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim().split("\\n");\n' },
] as const
