import { runVulnerable as classicVuln, runSafe as classicSafe } from './scenarios/classic'
import { runVulnerable as blindVuln,   runSafe as blindSafe   } from './scenarios/blind'
import { runVulnerable as timeVuln,    runSafe as timeSafe    } from './scenarios/timeBased'
import { runVulnerable as errorVuln,   runSafe as errorSafe   } from './scenarios/errorBased'

export type ScenarioType = 'classic' | 'blind' | 'time-based' | 'error-based'

export function runVulnerable(scenario: ScenarioType, username: string, password: string) {
  switch (scenario) {
    case 'classic':    return classicVuln(username, password)
    case 'blind':      return blindVuln(username, password)
    case 'time-based': return timeVuln(username, password)
    case 'error-based':return errorVuln(username, password)
  }
}

export function runSafe(scenario: ScenarioType, username: string, password: string) {
  switch (scenario) {
    case 'classic':    return classicSafe(username, password)
    case 'blind':      return blindSafe(username, password)
    case 'time-based': return timeSafe(username, password)
    case 'error-based':return errorSafe(username, password)
  }
}
