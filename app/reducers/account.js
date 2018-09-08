import { CREATE_ACCOUNT } from 'routes/extension/DownloadApps/store/actions'
import { CONFIGURE_LOCKING } from 'routes/extension/LockingConfiguration/store/actions'
import { UNLOCK_ACCOUNT } from 'components/Header/LockingState/store/actions'
import { LOCK_ACCOUNT } from 'actions/account'
import { UPDATE_MASTER_PASSWORD } from 'routes/extension/ChangePassword/store/actions'

const initalState = {
  lockedState: true,
  unlockingTime: undefined,
  autoLockInterval: 5,
  secondFA: {
    unlockedMnemonic: undefined
  }
}

function account (state = initalState, action) {
  switch (action.type) {
    case CREATE_ACCOUNT:
      const secondFA = {
        address: action.address,
        seed: action.seed,
        hmac: action.hmac
      }
      return {
        ...state,
        lockedState: true,
        secondFA
      }

    case LOCK_ACCOUNT:
      return {
        ...state,
        lockedState: true,
        unlockingTime: undefined,
        secondFA: {
          ...state.secondFA,
          unlockedMnemonic: undefined
        }
      }

    case UNLOCK_ACCOUNT:
      console.log('ON UNLOCK ACCOUNT', action)
      return {
        ...state,
        lockedState: false,
        unlockingTime: action.unlockingTime,
        secondFA: {
          ...state.secondFA,
          unlockedMnemonic: action.seed
        }
      }

    case CONFIGURE_LOCKING:
      return {
        ...state,
        autoLockInterval: action.autoLockInterval,
        unlockingTime: action.unlockingTime
      }

    case UPDATE_MASTER_PASSWORD:
      return {
        ...state,
        lockedState: true,
        unlockingTime: undefined,
        secondFA: {
          ...state.secondFA,
          seed: action.seed,
          hmac: action.hmac,
          unlockedMnemonic: undefined
        }
      }

    default:
      return state
  }
}

export default account
