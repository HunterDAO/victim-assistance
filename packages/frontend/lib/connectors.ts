import * as UAuthWeb3Modal from '@uauth/web3modal'
import UAuthSPA from '@uauth/js'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3Modal from 'web3modal'

// These options are used to construct the UAuthSPA instance: IUAuthOptions
export const uauthOptions: UAuthWeb3Modal.IUAuthOptions = {
  clientID: 'hunter-dao-dapp',
  redirectUri: 'http://localhost:3000',
  scope: 'openid wallet',
}

const providerOptions = {
  // Custom `web3modal` providers egistered using the "custom-" prefix.
  'custom-uauth': {
    display: UAuthWeb3Modal.display,

    connector: UAuthWeb3Modal.connector,

    package: UAuthSPA,

    options: uauthOptions,
  },

  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: process.env.INFURA_ID,
    },
  },

  // Include any other web3modal providers here too...
}

// const web3modal = new Web3Modal({providerOptions})

// UAuthWeb3Modal.registerWeb3Modal(web3modal) // Register the web3modal...

// export default web3modal;