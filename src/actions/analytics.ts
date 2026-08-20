"use server"

import { prisma } from "@/lib/prisma"

// Lightweight event tracking (fire and forget pattern recommended at call site)
export async function trackEvent(businessId: string, eventName: string, metadata?: any) {
  try {
    await prisma.pilotEvent.create({
      data: {
        businessId,
        eventName,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })
  } catch (error) {
    // Fail silently in production to avoid disrupting UX
    console.error(`[Analytics Error] Failed to track ${eventName}:`, error)
  }
}

// Global error logger
export async function logError(
  errorType: string, 
  message: string, 
  businessId?: string, 
  stackTrace?: string, 
  path?: string
) {
  try {
    await prisma.pilotError.create({
      data: {
        businessId,
        errorType,
        message,
        stackTrace,
        path
      }
    })
  } catch (error) {
    console.error(`[Error Logger] Failed to log error:`, error)
  }
}

// User feedback mechanism
export async function submitFeedback(businessId: string, category: string, content: string) {
  try {
    await prisma.pilotFeedback.create({
      data: {
        businessId,
        category,
        content
      }
    })
    return { success: true }
  } catch (error) {
    console.error(`[Feedback Error] Failed to submit feedback:`, error)
    return { success: false, error: "Gagal menyimpan masukan." }
  }
}
