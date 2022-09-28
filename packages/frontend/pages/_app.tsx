import {
  ChainId,
  Config,
  DAppProvider,
  MULTICALL_ADDRESSES,
} from '@usedapp/core';
import React from 'react';
// import dynamic from "next/dynamic";
import type { AppProps } from 'next/app';
import { useApollo } from '../lib/apolloClient';
import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from '../lib/context/auth';

const config: Config = {
  readOnlyUrls: {
    [ChainId.Mainnet]: `https://mainnet.infura.io/v3/${process.env.NEXT_APP_INFURA_MAINNET_ID}`,
    [ChainId.Ropsten]: `https://ropsten.infura.io/v3/${process.env.NEXT_APP_INFURA_ROPSTEN_ID}`,
    [ChainId.Polygon]: `https://matic.infura.io/v3/${process.env.NEXT_APP_INFURA_POLYGON_ID}`,
    [ChainId.Mumbai]: `https://mumbai.infura.io/v3/${process.env.NEXT_APP_INFURA_MUMBAI_ID}`,
    [ChainId.Hardhat]: 'http://localhost:8545',
    [ChainId.Localhost]: 'http://localhost:8545',
  },
  supportedChains: [
    ChainId.Mainnet,
    ChainId.Goerli,
    ChainId.Kovan,
    ChainId.Rinkeby,
    ChainId.Ropsten,
    ChainId.xDai,
    ChainId.Localhost,
    ChainId.Hardhat,
    ChainId.Mumbai,
    ChainId.Polygon
  ],
  multicallAddresses: {
    ...MULTICALL_ADDRESSES,
    // [ChainId.Hardhat]: MulticallContract,
    // [ChainId.Localhost]: MulticallContract,
  },
}

// const AppContainer = dynamic(import('./'), {ssr: false});

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  const apolloClient = useApollo(pageProps);

  const initialState = {
    isLoggedIn: false,
    user: undefined,
    walletAddress: undefined,
    client: undefined,
    inputValue: undefined,
    isLoading: false,
  };
  
  if (typeof window === undefined) {
    return null;
   } { 
    return (
      <AuthProvider authState={initialState}>
        <ApolloProvider client={apolloClient}>
          <DAppProvider config={config}>
            <ChakraProvider>
              <Component {...pageProps} />
            </ChakraProvider>
          </DAppProvider>
        </ApolloProvider>
      </AuthProvider>
    )
 }
}

export default MyApp
