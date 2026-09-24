import { api } from './client'
import type {
  Concept,
  ConceptSummary,
  MicroCheckAnswer,
  MicroCheckData,
  MicroCheckResult,
} from './types'

/**
 * Concept library + comprehension micro-check:
 *   GET  /concepts                    — the six defect-class concepts
 *   GET  /concept/{id}                — one concept: summary, examples, videos
 *   GET  /concept/{id}/micro-check    — the quiz, no answer key
 *   POST /concept/{id}/micro-check    — grade submitted answers
 */

export async function getConcepts(): Promise<ConceptSummary[]> {
  return api.get<ConceptSummary[]>('/concepts')
}

export async function getConcept(conceptId: string): Promise<Concept> {
  return api.get<Concept>(`/concept/${conceptId}`)
}

export async function getMicroCheck(conceptId: string): Promise<MicroCheckData> {
  return api.get<MicroCheckData>(`/concept/${conceptId}/micro-check`)
}

export async function submitMicroCheck(
  conceptId: string,
  answers: MicroCheckAnswer[],
): Promise<MicroCheckResult> {
  return api.post<MicroCheckResult>(`/concept/${conceptId}/micro-check`, { answers })
}
