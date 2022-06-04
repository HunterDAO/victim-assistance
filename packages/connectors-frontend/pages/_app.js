import { extendTheme, ChakraProvider } from "@chakra-ui/react"
import { theme } from "../styles/theme"
import '@fontsource/montserrat/400.css'
import '@fontsource/montserrat/600.css'
import '@fontsource/montserrat/800.css'


function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider resetCSS theme={theme} >
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
