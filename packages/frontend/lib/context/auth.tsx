import { 
    createContext, 
    Dispatch, 
    useContext, 
    // useEffect, 
    useReducer
} from "react";
import Client, { UserInfo } from "@uauth/js";
import WalletConnectProvider from "@walletconnect/web3-provider";

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
    // const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    // const [user, setUser] = useState<UserInfo>();
    // const [walletAddress, setAccount] = useState<string>();
    // const [client, setClient] = useState<WalletConnectProvider>();

    // useEffect(() => {
        // 
    // }, []);

    // const signup = async () => {}

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

