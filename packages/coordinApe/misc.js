import * as ethers from 'ethers'
const provider = new ethers.providers.Web3Provider(window.ethereum, 'any')

provider.send('eth_requestAccounts', []).then(async (addr) => {
  const signer = provider.getSigner()
  let now = Math.floor(Date.now() / 1000)
  const address = await signer.getAddress()
  const dataSign = `Login to Coordinape ${now}`
  const signature = await signer.signMessage(dataSign)
})
