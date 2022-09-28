import {
    Button,
    Container,
    Flex,
    // Image,
    Link,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    SimpleGrid,
} from '@chakra-ui/react'
import Client from '@uauth/js'
import NextLink from 'next/link'
import UAuthSPA from '@uauth/js'
import { useEffect } from 'react'
import { UserInfo } from '@uauth/js'
import { useEthers } from '@usedapp/core'
import web3modal from '../../lib/connectors'
import { truncateHash } from '../../lib/utils'
import { useAuth } from '../../lib/context/auth'
import {uauthOptions} from '../../lib/connectors'
import * as UAuthWeb3Modal from '@uauth/web3modal'

function Nav() {
    const { deactivate } = useEthers();
    const { isLoading, walletAddress, client, login, authDispatch } = useAuth();

    // useEffect(() => {
    //   UAuthWeb3Modal.getUAuth(UAuthSPA, uauthOptions)
    //     .loginCallback()
    //     .then(async () => {
    //       authDispatch({ type: 'setClient', value: await web3modal.connectTo('custom-uauth') });
    //       authDispatch({ type: 'setIsLoading', value: true });
    //       client
    //         .user()
    //         .then((user: UserInfo) => authDispatch({ type: 'loginAction', value: { walletAddress: user.wallet_address, user, isLoggedIn: true } }))
    //         .catch((err: string) => {
    //           throw new Error(err)
    //         })
    //         .finally(() => authDispatch({ type: 'setIsLoading', value: true }));
    //     })
    //     .catch(error => {
    //       throw new Error(error); // TODO: Redirect to failure page
    //     })
    // }, [])


    const handleWeb3Modal = async () => {
      const client: Client = await web3modal.connect();
      authDispatch({ type: 'setClient', value: client })
      login();
      // await new UAuth(uauthOptions)
      //   .user()
      //   .then((user: UserInfo) => authDispatch({ type: 'setIsLoading', value: true }))
      //   .catch(error => {
      //     throw new Error(error); // TODO: Redirect to failure page
      // });
    };
    
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
            {walletAddress ? (
              <Flex
                order={[-1, null, null, 2]}
                alignItems={'center'}
                justifyContent={['flex-start', null, null, 'flex-end']}
              >
                <Menu placement="bottom-end">
                  <MenuButton as={Button} ml="4">
                    {truncateHash(walletAddress)}
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={deactivate}>Disconnect</MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            ) : (

              <Button
              isLoading={isLoading}
              colorScheme='teal'
              variant='outline'
              color="#0D67FE" onClick={handleWeb3Modal}>
                Login With Unstoppable
              </Button>
            )}
          </SimpleGrid>
        </Container>
      </header>
    )
}

export default Nav