import { getDb } from './mongodb';

/**
 * Generate a unique transaction ID in format: TXN-YYYYMMDD-XXX
 * Example: TXN-20250101-001
 */
export async function generateTransactionId(): Promise<string> {
  const db = await getDb();
  const today = new Date();
  
  // Format date as YYYYMMDD
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Find the last transaction ID for today
  const lastTransaction = await db
    .collection('transactions')
    .find({
      transactionId: { $regex: `^TXN-${dateStr}-` }
    })
    .sort({ transactionId: -1 })
    .limit(1)
    .toArray();
  
  let sequence = 1;
  
  if (lastTransaction.length > 0) {
    // Extract sequence number from last transaction
    const lastId = lastTransaction[0].transactionId;
    const lastSequence = parseInt(lastId.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  // Format sequence as 3 digits
  const sequenceStr = String(sequence).padStart(3, '0');
  
  return `TXN-${dateStr}-${sequenceStr}`;
}

/**
 * Get current time in HH:MM:SS format
 */
export function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}
