export const UNLOCK_ACCOUNT = 'UNLOCK_ACCOUNT'

export const unlockAccount = (seed, unlockingTime) => {
  return {
        type: UNLOCK_ACCOUNT,
            seed,
            unlockingTime
    }
}
