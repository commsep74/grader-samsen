import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const jetbrainsMono =
  "'JetBrains Mono', ui-monospace, monospace" as const

export const chartTick = { fontSize: 12, fontFamily: jetbrainsMono } as const

export const chartTooltipStyle = {
  fontFamily: jetbrainsMono,
  fontSize: 12,
} as const

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
