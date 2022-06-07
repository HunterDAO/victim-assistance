import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  Spinner
} from '@chakra-ui/react'
import { useEthers } from '@usedapp/core'
import Layout from '../components/layout/Layout'
import LitJsSdk from 'lit-js-sdk'
import { toString as uint8arrayToString } from "uint8arrays/to-string";
import { fromString as uint8arrayFromString } from "uint8arrays/from-string";

import { ethers } from 'ethers'


const abi = [
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "_condition",
        "type": "bool"
      }
    ],
    "name": "setCondition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFlag",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function LitProtocolExample(): JSX.Element {
  const { library, chainId } = useEthers();
  const [cond, setCond] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chain, setChain] = useState('mumbai');
  const [strEncrypted, setStrEncrypted] = useState('');
  const [contractAddress, setContractAddress] = useState('0x938a5Edb375DDe749616232f7f4F628D6610684c');
  const [strToBeEncrypt, setStrToBeEncrypt] = useState('Input here the string that will be encrypted by lit protocol');
  const [symEncrypted, setSymEncrypted] = useState('');


  useEffect(() => {

    async function init() {
      //INIT LIT CLIENT
      const client = new LitJsSdk.LitNodeClient();
      await client.connect();
      //@ts-ignore
      window.litNodeClient = client;
    }

    init()

  }, [])



  async function getFlag() {


    if (chainId == 80001) {

      const signer = library?.getSigner();
      const c = new ethers.Contract('0x938a5Edb375DDe749616232f7f4F628D6610684c', abi, signer);
      if (signer) {
        try {
          const res = await c.getFlag();
          alert(res);
          setCond(res);
        } catch (e) {
          alert(e);
        }

      }
    } else { alert('connect changing to mumbai network') }
  }

  async function setCondition() {

    if (chainId == 80001) {


      const signer = library?.getSigner();
      const c = new ethers.Contract('0x938a5Edb375DDe749616232f7f4F628D6610684c', abi, signer);
      if (signer) {
        try {
          setLoading(true);
          const oldCond = await c.getFlag();
          console.log(oldCond, '->', !oldCond);
          const tx = await c.setCondition(!oldCond);
          const receipt = await tx.wait();
          console.log(receipt);
          setLoading(false);
          setCond(!oldCond);
          alert(receipt.transactionHash);
        } catch (e) {
          setLoading(false);
          alert(e);
        }

      }
    } else {

      alert('connect changing to mumbai network');
    }
  }

  async function encrypt() {
    try {
      const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: chain });
      const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
        strToBeEncrypt
      );
      console.log('encryptedString', encryptedString);
      console.log('symmetricKey', symmetricKey);
      const encryptedStringBase64 = uint8arrayToString(
        new Uint8Array(await encryptedString.arrayBuffer()),
        "base64"
      );
      setStrEncrypted(encryptedStringBase64);
      console.log('encryptedStringBase64', encryptedStringBase64);
      const evmContractConditions =
        [
          {
            contractAddress: contractAddress,
            functionName: "getFlag",
            functionParams: [],
            functionAbi: {
              "inputs": [],
              "name": "getFlag",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            chain: chain,
            returnValueTest: {
              key: "",
              comparator: "=",
              value: "true",
            },
          },
        ];
      //@ts-ignore
      const encSymmetricKey = await window.litNodeClient.saveEncryptionKey({
        evmContractConditions,
        symmetricKey,
        authSig,
        chain,
      });
      console.log(encSymmetricKey);
      const encSymmetricStringBase64 = uint8arrayToString(
        encSymmetricKey,
        "base64"
      );
      console.log('encSymmetricStringBase64', encSymmetricStringBase64);
      setSymEncrypted(encSymmetricStringBase64);
    } catch (e: any) { alert(e.message) }
  }
  async function decrypt() {
    try {
      const evmContractConditions =
        [
          {
            contractAddress: contractAddress,
            functionName: "getFlag",
            functionParams: [],
            functionAbi: {
              "inputs": [],
              "name": "getFlag",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            chain: chain,
            returnValueTest: {
              key: "",
              comparator: "=",
              value: "true",
            },
          },
        ];
      const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: chain });
      const check = uint8arrayFromString(
        symEncrypted,
        "base64"
      );
      //@ts-ignore
      const symmetricKey = await window.litNodeClient.getEncryptionKey({
        evmContractConditions,
        // Note, below we convert the encryptedSymmetricKey from a UInt8Array to a hex string.  
        // This is because we obtained the encryptedSymmetricKey from "saveEncryptionKey" which returns a UInt8Array.  
        // But the getEncryptionKey method expects a hex string.
        toDecrypt: LitJsSdk.uint8arrayToString(check, "base16"),
        chain,
        authSig
      })
      const arrayBuffer = uint8arrayFromString(
        strEncrypted,
        "base64"
      ).buffer;
      const blob = new Blob([arrayBuffer]);
      const decryptedString = await LitJsSdk.decryptString(
        blob,
        symmetricKey
      );
      alert(decryptedString)
      alert('try setting the condition to false  to see that the decrypting authorization condition changed');
    } catch (e: any) {
      alert(e.message);
      alert('if you saw some message error from lit protocol, it means that you should set the condition to true');
    }
  }
  function handleStr(e) {
    setStrToBeEncrypt(e.target.value);
  }
  return (
    <Layout>
      <Heading as="h1" >
        Lit protocol simple example with string encryption
      </Heading>
      <Text mb='12'> ... and decryption gated by a smart contract function</Text>
      <Box maxWidth="container.sm">
        <Input m='3' onChange={handleStr} placeholder={strToBeEncrypt}></Input>
        <Button mx='1' onClick={getFlag}>getFlag()</Button>
        <Button mx='1' onClick={setCondition}>setCondition({String(!cond)})</Button>
        <Button mx='1' onClick={encrypt}>encrypt()</Button>
        <Button mx='1' onClick={decrypt}>decrypt()</Button>
        {loading && (<Spinner />)}
      </Box>
    </Layout>
  )
}

export default LitProtocolExample;
