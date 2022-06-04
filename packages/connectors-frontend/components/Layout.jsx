import { Container, Stack } from "@chakra-ui/react"

export const Layout = ({ children }) => {
  return (
    <Container maxW="7xl">
      <Stack align={"center"} spacing="8" direction="column">
        {children}
      </Stack>
    </Container>
  )
}
