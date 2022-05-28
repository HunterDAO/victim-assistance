import {
    Button,
    Container,
    Flex,
    Image,
    Link,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    SimpleGrid,
} from '@chakra-ui/react'
import { useEthers } from '@usedapp/core'
import blockies from 'blockies-ts'
import NextLink from 'next/link'
import Balance from '../web3/Balance'
import ConnectWallet from '../web3/ConnectWallet'
import { truncateHash } from '../../lib/utils'

function Nav() {
    const { account, deactivate } = useEthers()

    let blockieImageSrc
    if (typeof window !== 'undefined') {
        blockieImageSrc = blockies.create({ seed: account }).toDataURL()
    }
    
    return (
        <header>
        <Container maxWidth="container.xl">
          <SimpleGrid
            columns={[1, 1, 1, 2]}
            alignItems="center"
            justifyContent="space-between"
            py="8"
          >
            <Flex py={[4, null, null, 0]}>
              <NextLink href="/" passHref>
                <Link px="4" py="1">
                  Home
                </Link>
              </NextLink>
              <NextLink href="/graph-example" passHref>
                <Link px="4" py="1">
                  Graph Example
                </Link>
              </NextLink>
              <NextLink href="/signature-example" passHref>
                <Link px="4" py="1">
                  Signature Example
                </Link>
              </NextLink>
            </Flex>
            {account ? (
              <Flex
                order={[-1, null, null, 2]}
                alignItems={'center'}
                justifyContent={['flex-start', null, null, 'flex-end']}
              >
                <Balance />
                <Image ml="4" src={blockieImageSrc} alt="blockie" />
                <Menu placement="bottom-end">
                  <MenuButton as={Button} ml="4">
                    {truncateHash(account)}
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={deactivate}>Disconnect</MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            ) : (
              <ConnectWallet />
            )}
          </SimpleGrid>
        </Container>
      </header>
    )
}

export default Nav