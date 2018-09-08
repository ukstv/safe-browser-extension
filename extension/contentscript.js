import {
    MSG_ALLOW_INJECTION,
    MSG_UPDATE_CURRENT_SAFE,
    MSG_SHOW_POPUP,
    EV_SHOW_POPUP,
    EV_SCRIPT_READY,
    EV_UPDATE_WEB3,
    MSG_RESOLVED_TRANSACTION,
    EV_RESOLVED_TRANSACTION, EV_SILENT_SIGN, MSG_SILENT_SIGN, EV_SILENT_SIGN_DONE,
    EV_SILENT_SEND_TX, EV_SILENT_SEND_TX_DONE, MSG_SILENT_SEND_TX, MSG_SILENT_SEND_TX_DONE
} from './utils/messages'

// Checks if the page is whitelisted to inject the web3 provider
chrome.runtime.sendMessage(
  {
    msg: MSG_ALLOW_INJECTION,
    url: window.location.host
  },
  function (response) {
    if (response.answer) {
      injectScript()
        console.log('on MSG_ALLOW_INJECTION')
      setUpWeb3(response.currentSafe, response.currentDelegate)
    } else {
      console.log('This web page is not whitelisted.')
    }
  }
)

function injectScript () {
  try {
    // Injects script.js with the web3 provider
    var xhr = new window.XMLHttpRequest()
    xhr.open('GET', chrome.extension.getURL('script.js'), true)
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        var s = document.createElement('script')
        s.type = 'text/javascript'
        s.src = chrome.extension.getURL('script.js')
        var container = (document.documentElement || document.head)
        container.insertBefore(s, container.children[0])
      }
    }
    xhr.send()
  } catch (err) {
    console.error('Gnosis web3 provider injection failed.', err)
  }
}

function setUpWeb3 (currentSafe, currentDelegate) {
  document.addEventListener(EV_SCRIPT_READY, function (data) {
    console.log('on EV_SCRIPT_READY', currentSafe, currentDelegate)
    updateWeb3(currentSafe, currentDelegate)
  })
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.msg === MSG_UPDATE_CURRENT_SAFE) {
      updateWeb3(request.newSafeAddress, request.newDelegateAddress)
    }
  }
)

function updateWeb3 (currentSafe, currentDelegate) {
  const updateWeb3Event = new window.CustomEvent(
    EV_UPDATE_WEB3,
    {
      detail: {
        currentSafe: currentSafe,
          currentDelegate: currentDelegate
      }
    }
  )
  document.dispatchEvent(updateWeb3Event)
}

document.addEventListener(EV_SHOW_POPUP, function (data) {
  chrome.runtime.sendMessage({
    msg: MSG_SHOW_POPUP,
    tx: data.detail
  })
})

document.addEventListener(EV_SILENT_SIGN, function (data) {
    chrome.runtime.sendMessage({
        msg: MSG_SILENT_SIGN,
        detail: data.detail
    }, function (response) {
        console.log('got MSG_SILENT_SIGN_DONE', response)
        const silentSignDoneEvent = new window.CustomEvent(
            EV_SILENT_SIGN_DONE,
            { detail: response.signature }
        )
        document.dispatchEvent(silentSignDoneEvent)
    })
})

document.addEventListener(EV_SILENT_SEND_TX, function (data) {
    chrome.runtime.sendMessage({
        msg: MSG_SILENT_SEND_TX,
        detail: data.detail
    }, function (response) {
        console.log('got MSG_SILENT_SEND_TX_DONE', response)
        const silentSignDoneEvent = new window.CustomEvent(
            EV_SILENT_SEND_TX_DONE,
            { detail: response.txHex }
        )
        document.dispatchEvent(silentSignDoneEvent)
    })
})


chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.msg === MSG_RESOLVED_TRANSACTION) {
      const resolvedTransactionEvent = new window.CustomEvent(
        EV_RESOLVED_TRANSACTION,
        { detail: request.hash }
      )
      document.dispatchEvent(resolvedTransactionEvent)
    }
  }
)
