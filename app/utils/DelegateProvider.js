import Subprovider from 'web3-provider-engine/subproviders/subprovider'
import Web3 from 'web3'
import {
    EV_RESOLVED_TRANSACTION,
    EV_SHOW_POPUP,
    EV_SILENT_SIGN,
    EV_SILENT_SIGN_DONE,
    EV_SILENT_SEND_TX,
    EV_SILENT_SEND_TX_DONE
} from '../../extension/utils/messages'

class DelegateProvider extends Subprovider {
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

      case 'eth_sendTransaction':
          this.sendTransaction(payload, end)
          return

      default:
        next()
    }
  }

  signPayload = (payload, end) => {
    const silentSignEvent = new window.CustomEvent(
      EV_SILENT_SIGN,
        {
          detail: {
            address: payload.params[0],
            data: payload.params[1]
          }
        }
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

  sendTransaction = (payload, end) => {
      const silentSendTransactionEvent = new window.CustomEvent(
          EV_SILENT_SEND_TX,
          {
              detail: payload
          }
      )
      console.log('sendTransaction', silentSendTransactionEvent)
      document.dispatchEvent(silentSendTransactionEvent)

      const handler = (data) => {
          document.removeEventListener(EV_SILENT_SEND_TX_DONE, handler)
          if (data.detail) {
              console.log('handler', data)
              let txHex = data.detail
              let w3 = new Web3(this.engine)
              w3.eth.sendRawTransaction(txHex, (error, txId) => {
                  console.log('FOO', error, txId)
                  end(error, txId)
              })
          } else {
              end(new Error('The transaction was rejected by the silent signer'))
          }
      }
      document.addEventListener(EV_SILENT_SEND_TX_DONE, handler)
  }
}

module.exports = DelegateProvider
