import FilecoinNumber from '@openworklabs/filecoin-number'
import LotusRpcEngine from '@openworklabs/lotus-jsonrpc-engine'

export { default as LocalNodeProvider } from './providers/LocalNodeProvider'
export { default as LedgerProvider } from './providers/LedgerProvider'
export * from './utils'

class Filecoin {
  constructor(provider, { apiAddress, token } = {}) {
    this.wallet = provider
    this.jsonRpcEngine = new LotusRpcEngine({
      apiAddress: apiAddress || 'http://127.0.0.1:1234/rpc/v0',
      token,
    })
  }

  getBalance = async address => {
    const balance = await this.jsonRpcEngine.request('WalletBalance', address)
    return new FilecoinNumber(balance, 'attofil')
  }

  sendMessage = async (message, signature) => {
    const signedMessage = {
      Message: message,
      Signature: {
        Type: 'secp256k1',
        Data: signature,
      },
    }

    const tx = await this.jsonRpcEngine.request('MpoolPush', signedMessage)
    return tx
  }

  getNonce = async address => {
    if (!address) throw new Error('No address provided.')
    return this.jsonRpcEngine.request('MpoolGetNonce', address)
  }

  estimateGas = async message => {
    if (!message) throw new Error('No message provided.')
    const stateCallRes = await this.jsonRpcEngine.request(
      'StateCall',
      message,
      null,
    )
    if (stateCallRes.Error) throw new Error(stateCallRes.Error)
    return new FilecoinNumber(stateCallRes.GasUsed, 'attofil')
  }
}

export default Filecoin
