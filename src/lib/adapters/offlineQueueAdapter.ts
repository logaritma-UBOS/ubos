export type PendingTransaction = {
  clientTransactionId: string
  cart: { quantity: number; price: number; productId: string }[]
  total: number
  timestamp: string
}

export function getPendingTransactions(): PendingTransaction[] {
  if (typeof window === "undefined") return []
  try {
    const queue = JSON.parse(localStorage.getItem("ubos_sync_queue") || "[]")
    return queue
  } catch {
    return []
  }
}

export function savePendingTransaction(tx: PendingTransaction) {
  if (typeof window === "undefined") return
  const queue = getPendingTransactions()
  queue.push(tx)
  localStorage.setItem("ubos_sync_queue", JSON.stringify(queue))
}

export function setPendingTransactions(queue: PendingTransaction[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("ubos_sync_queue", JSON.stringify(queue))
}

export function getPendingCount(): number {
  return getPendingTransactions().length
}
