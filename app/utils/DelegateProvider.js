import Subprovider from 'web3-provider-engine/subproviders/subprovider'
import {
    EV_SILENT_SIGN,
    EV_SILENT_SIGN_DONE
} from '../../extension/utils/messages'

class GnosisProvider extends Subprovider {
  constructor (props) {
    super(props)
    this.currentSafe = undefined
  }

  updateCurrentSafe = (currentSafe) => {
    this.currentSafe = currentSafe
  }

  handleRequest = (payload, next, end) => {
    const accounts = [this.currentSafe]

    switch (payload.method) {
      case 'eth_accounts':
        end(null, accounts)
        return

      case 'eth_coinbase':
        end(null, accounts)
        return

      case 'eth_sign':
        this.signPayload(payload, end)
        return

      default:
        next()
    }
  }

  signPayload = (payload, end) => {
    const silentSignEvent = new window.CustomEvent(
      EV_SILENT_SIGN,
        { detail: payload.params[0] }
    )
    document.dispatchEvent(silentSignEvent)

    const removeSignHandler = (data) => {
      document.removeEventListener(EV_SILENT_SIGN_DONE, removeSignHandler)
      if (data.detail) {
        end(null, data.detail)
      } else {
        end(new Error('The transaction was rejected by the silent signer'))
      }
    }
    document.addEventListener(EV_SILENT_SIGN_DONE, removeSignHandler)
  }
}

module.exports = GnosisProvider
