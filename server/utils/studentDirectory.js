import Student from '../models/Student.js'
import { AppError } from './AppError.js'

/** Reject UIDs that are not in the student master directory. */
export async function assertStudentInMaster(uid) {
  if (!uid) return
  const found = await Student.exists({ uid, isActive: true })
  if (!found) {
    throw new AppError(
      `Roll number "${uid}" is not in the student directory — add it under Students first`,
      400,
    )
  }
}