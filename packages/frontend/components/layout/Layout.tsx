import React from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Container,
} from '@chakra-ui/react'
import { useNotifications } from '@usedapp/core'
import { truncateHash } from '../../lib/utils'
import Head, { MetaProps } from './Head'
import Footer from './Footer'
import Nav from './Nav'

// Extends `window` to add `ethereum`.
declare global {
  interface Window {
    ethereum: any
  }
}

/**
 * Constants & Helpers
 */

// Title text for the various transaction notifications.
const TRANSACTION_TITLES = {
  transactionStarted: 'Local Transaction Started',
  transactionSucceed: 'Local Transaction Completed',
}

/**
 * Prop Types
 */
interface LayoutProps {
  children: React.ReactNode
  customMeta?: MetaProps
}

/**
 * Component
 */
const Layout = ({ children, customMeta }: LayoutProps): JSX.Element => {
  const { notifications } = useNotifications()


  return (
    <>
      <Head customMeta={customMeta} />
      <Nav />
      <main>
        <Container maxWidth="container.xl">
          {children}
          {notifications.map((notification) => {
            if (notification.type === 'walletConnected') {
              return null
            }
            return (
              <Alert
                key={notification.id}
                status="success"
                position="fixed"
                bottom="8"
                right="8"
                width="400px"
              >
                <AlertIcon />
                <Box>
                  <AlertTitle>
                    {TRANSACTION_TITLES[notification.type]}
                  </AlertTitle>
                  <AlertDescription overflow="hidden">
                    Transaction Hash:{' '}
                    {truncateHash(notification.transaction.hash, 61)}
                  </AlertDescription>
                </Box>
              </Alert>
            )
          })}
        </Container>
      </main>
      <Footer />
    </>
  )
}

export default Layout
