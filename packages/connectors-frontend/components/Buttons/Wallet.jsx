import { Button } from "@chakra-ui/react"

export const Wallet = ({ children, onClick }) => {
  return (
    <Button
      paddingX="6"
      display="inline-flex"
      bg="primary"
      color="white"
      onClick={onClick}
    >
      {children}
    </Button>
  )
}
