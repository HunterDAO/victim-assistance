import { 
    createContext, 
    Dispatch, 
    useContext, 
    useEffect, 
    useState,
    useReducer
} from "react";
import UAuthSPA from '@uauth/js'
import Web3Modal from 'web3modal'
import Client, { UserInfo } from "@uauth/js";
import * as UAuthWeb3Modal from '@uauth/web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Core from "web3modal";
/**
 * Types
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
type AuthStateType = {
    isLoggedIn:  boolean;
    user: UserInfo;
    walletAddress: string;
    client: WalletConnectProvider;
    inputValue: string;
    isLoading: boolean;
    resetAuth?: null;
};

type AuthStateActionType =
| {
    type: 'loginAction'
    payload: { 
        isLoggedIn: AuthStateType['isLoggedIn'], 
        user: AuthStateType['user'], 
        walletAddress: AuthStateType['walletAddress']
    }
  }
| {
    type: 'setIsLoggedIn'
    payload: AuthStateType['isLoggedIn']
  }
| {
    type: 'setUser'
    payload: AuthStateType['user']
  }
| {
    type: 'setAccount'
    payload: AuthStateType['walletAddress']
  }
| {
    type: 'setClient'
    payload: AuthStateType['client']
  }
| {
    type: 'setInputValue'
    payload: AuthStateType['inputValue']
  }
| {
    type: 'setIsLoading'
    payload: AuthStateType['isLoading']
}
| {
    type: 'resetAuth'
};

function authReducer(auth: AuthStateType, action: AuthStateActionType): AuthStateType {
    switch (action.type) {
        case 'loginAction':
        return {
            ...auth,
            isLoggedIn: action.payload.isLoggedIn,
            user: action.payload.user,
            walletAddress: action.payload.walletAddress
        }
        case 'setIsLoggedIn':
        return {
            ...auth,
            isLoggedIn: action.payload,
        }
        case 'setUser':
        return {
            ...auth,
            user: action.payload
        }
        case 'setAccount':
        return {
            ...auth,
            walletAddress: action.payload,
        }
        case 'setClient':
        return {
            ...auth,
            client: action.payload,
        }
        case 'setInputValue':
        return {
            ...auth,
            inputValue: action.payload,
        }
        case 'setIsLoading':
        return {
            ...auth,
            isLoading: action.payload,
        }
        case 'resetAuth': 
        return {
            isLoggedIn: false,
            user: undefined,
            walletAddress: undefined,
            client: undefined,
            inputValue: undefined,
            isLoading: false,
        }
        default:
        throw new Error()
    }
}

type AuthContextType = {
    authDispatch: Dispatch<{ type: string, value?: any }>,
    isLoggedIn?: boolean,
    user?: UserInfo,
    walletAddress?: string,
    client?: Client,
    inputValue?: string,
    isLoading?: boolean,
    // signup?: () => Promise<void>,
    login?: () => Promise<void>,
    logout?: () => Promise<void>,
};
  
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({authState: AuthStateType,  children }) => {
    const [auth, authDispatch] = useReducer(authReducer, undefined);
    const [web3modal, setWeb3Modal] = useState<Core>();
    // const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        if (window) {
            setWeb3Modal(new Web3Modal({providerOptions}))
        };
    }, []);

    const uauthOptions: UAuthWeb3Modal.IUAuthOptions = {
        clientID: 'hunter-dao-dapp',
        redirectUri: 'http://localhost:3000',
        scope: 'openid wallet',
    }

    const providerOptions = {
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
    }
    

    UAuthWeb3Modal.registerWeb3Modal(web3modal);

    const login = async () => {
        return await auth.client.user()
            .then((user: UserInfo) => authDispatch({ type: 'loginAction', payload: { isLoggedIn: true, user, walletAddress: user.wallet_address }}))
            .catch((error: string) => {
                throw new Error(error);
        });
    }

    const logout = async () => {
        authDispatch({ type: 'resetAuth' });
    }

    return (
        <AuthContext.Provider 
            value={{
                authDispatch,
                isLoggedIn: false,
                user: undefined,
                walletAddress: undefined,
                client: undefined,
                inputValue: undefined,
                isLoading: false,
                // signup,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
};

export { AuthProvider, useAuth };

