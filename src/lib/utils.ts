import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getRankColor(tier: number): string {
  if (tier >= 24) return 'text-yellow-400'
  if (tier >= 21) return 'text-purple-400'
  if (tier >= 18) return 'text-red-400'
  if (tier >= 15) return 'text-blue-400'
  if (tier >= 12) return 'text-green-400'
  return 'text-gray-400'
}

export function getWinRate(wins: number, losses: number): string {
  const total = wins + losses
  if (total === 0) return '0.0'
  return ((wins / total) * 100).toFixed(1)
}
