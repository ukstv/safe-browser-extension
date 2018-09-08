import Web3 from 'web3'
import fetch from 'node-fetch'
import TruffleContract from 'truffle-contract'

import config from '../../../../../../../config'
import GnosisSafePersonalEdition from '../../../../../../../contracts/GnosisSafePersonalEdition.json'
import BigNumber from "bignumber.js";

export const getGasEstimation = (
  safe,
  to,
  value,
  data,
  operation
) => {
  const DUMMY = {
      safeTxGas: new BigNumber(100000000),
      dataGas: new BigNumber(100000000),
      gasPrice: new BigNumber(100000000),
      gasToken: '',
  }

  const url = config.transactionRelayServiceUrl + 'safes/' + safe + '/transactions/estimate/'
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
  const body = JSON.stringify({
    safe,
    to,
    value,
    data,
    operation
  })

  return fetch(url, {
    method: 'POST',
    headers,
    body
  })
    .then(response => {
      if (response.status === 200) return response.json()
    })
    .then(data => {
      console.log('getGasEstimation', data)
        if (data) {
          return data
        } else {
          return DUMMY
        }
    })
    .catch((err) => {
      console.error(err)
      return DUMMY
    })
}

export const getTxHash = (tx, safeAddress) => {
  const contract = TruffleContract(GnosisSafePersonalEdition)
  const provider = new Web3.providers.HttpProvider(
    config.networks[config.currentNetwork].url
  )
  contract.setProvider(provider)

  return contract.at(safeAddress)
    .then((instance) => {
      return instance.getTransactionHash.call(
        tx.to,
        tx.value,
        tx.data,
        tx.operation,
        tx.txGas,
        tx.dataGas,
        tx.gasPrice,
        tx.gasToken,
        tx.nonce
      )
    })
    .then((hash) => {
      return hash
    })
    .catch((err) => {
      console.error(err)
    })
}
