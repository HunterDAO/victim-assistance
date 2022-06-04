import { SimpleGrid } from "@chakra-ui/react"
import { Children } from "react"

const NavigationItem = ({ children }) => {
  return (
    <a href="#" className="navigation-item">
      {children}
    </a>
  )
}

export const Navigation = ({ children }) => {
  const basicItemsCount = 3
  const count = Children.count(children) || 0
  return (
    <SimpleGrid columns={[1, null, basicItemsCount + count]} spacing={8} w="100%">
      <NavigationItem href="/">Home</NavigationItem>
      <NavigationItem href="/about">About</NavigationItem>
      <NavigationItem href="/contact">Contact</NavigationItem>
      {children}
    </SimpleGrid>
  )
}
