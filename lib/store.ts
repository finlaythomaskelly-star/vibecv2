// lib/store.ts
// Simple JSON file-based store — no database needed for MVP
// In production, swap this for PlanetScale, Supabase, or any DB

import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), '.data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

export interface User {
  id: string
  email: string
  passwordHash: string
  isSubscriber: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  roastsUsed: number
  createdAt: string
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]')
}

export function getUsers(): User[] {
  ensureDataDir()
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'))
}

export function saveUsers(users: User[]) {
  ensureDataDir()
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email === email.toLowerCase())
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id)
}

export function createUser(data: Omit<User, 'id' | 'createdAt' | 'roastsUsed' | 'isSubscriber'>): User {
  const users = getUsers()
  const user: User = {
    ...data,
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    isSubscriber: false,
    roastsUsed: 0,
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  saveUsers(users)
  return user
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === id)
  if (idx === -1) return null
  users[idx] = { ...users[idx], ...updates }
  saveUsers(users)
  return users[idx]
}
