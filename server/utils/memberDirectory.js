import Member from '../models/Member.js'
import { AppError } from './AppError.js'

/** Reject college IDs that are not in the members master directory. */
export async function assertMemberInMaster(uid) {
  if (!uid) return
  const found = await Member.exists({ uid, isActive: true })
  if (!found) {
    throw new AppError(
      `College ID "${uid}" is not in the members directory — add it under Members first`,
      400,
    )
  }
}

/** Resolve a college ID to its directory entry (used for member self-service). */
export async function findMember(uid) {
  if (!uid) return null
  return Member.findOne({ uid, isActive: true }).lean()
}