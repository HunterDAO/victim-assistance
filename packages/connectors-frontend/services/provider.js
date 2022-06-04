import { ethers } from "ethers"

export const getProvider = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  return provider
}

export const requestAccounts = async (provider) => {
  return await provider.send("eth_requestAccounts", [])
}

export const signMessage = async () => {
  const provider = await getProvider()
  const signer = provider.getSigner()
  const dataSign = `Login to AnyApp`
  const signature = await signer.signMessage(dataSign)
  return {
    signature,
    digest: dataSign,
  }
}

export const takeMessageFromLocalStorageOrSign = async () => {
  let signedMessage = localStorage.getItem("signedMessage")
  signedMessage = JSON.parse(signedMessage)
  if (!signedMessage) {
    signedMessage = await signMessage()
  }
  return signedMessage
}