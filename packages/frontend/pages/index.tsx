import React from 'react'
import Layout from '../components/layout/Layout'
// import { utils } from 'ethers'
// import { YourContract as YourContractType } from '../types/typechain'
import { Box, Button, Divider, Heading, Input, Text } from '@chakra-ui/react'
import { useAuth } from '../lib/context/auth'
// import YourContract from '../artifacts/contracts/YourContract.sol/YourContract.json'
// import { YourContract as LOCAL_CONTRACT_ADDRESS } from '../artifacts/contracts/contractAddress'

function HomeIndex() {
  const { isLoading, authDispatch } = useAuth();

  return (
    <Layout>
      <Heading as="h1" mb="8">
        Next.js Ethereum Starter
      </Heading>
      {/* <Button
        as="a"
        size="lg"
        colorScheme="teal"
        variant="outline"
        href="https://github.com/ChangoMan/nextjs-ethereum-starter"
        target="_blank"
        rel="noopener noreferrer"
      >
        Get the source code!
      </Button>
      <Text mt="8" fontSize="xl">
        This page only works on the ROPSTEN Testnet or on a Local Chain.
      </Text> */}
      <Box maxWidth="container.sm" p="8" mt="8" bg="gray.100">
        <Text fontSize="xl">Contract Address: {"0x000"}</Text>
        <Divider my="8" borderColor="gray.400" />
        <Box>
          <Text fontSize="lg">Greeting: {"0x000"}</Text>
          {/* eslint-disable-next-line */}
          <Button mt="2" colorScheme="teal" onClick={() => {console.log(true)}}>
            Fetch Greeting
          </Button>
        </Box>
        <Divider my="8" borderColor="gray.400" />
        <Box>
          <Input
            bg="white"
            type="text"
            placeholder="Enter a Greeting"
            onChange={() => {
              authDispatch({
                type: 'resetAuth',
              })
            }}
          />
          <Button
            mt="2"
            colorScheme="teal"
            isLoading={isLoading}
            onClick={() => authDispatch({ type: 'setIsLoading', value: true })}
          >
            Set Greeting
          </Button>
        </Box>
        <Divider my="8" borderColor="gray.400" />
        <Text mb="4">This button only works on a Local Chain.</Text>
        <Button
          colorScheme="teal"
          // eslint-disable-next-line
          onClick={() => {console.log(true)}}
          isDisabled={true}
        >
          Send Funds From Local Hardhat Chain
        </Button>
      </Box>
    </Layout>
  )
}

export default HomeIndex
