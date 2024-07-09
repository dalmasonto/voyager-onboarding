import { Box, Container, Flex, Image } from "@chakra-ui/react";
import CustomLink from "./CustomLink";

const Navbar = () => {
  return (
    <Container maxW={'container.2xl'} bg={'gray.100'} h={'60px'}>
      <Flex
        direction="row"
        gap={"1rem"}
        alignItems={"center"}
        justifyContent={"space-between"}
        padding={"1rem"}
        h={'100%'}
        w={'100%'}
      >
        <Box>
          <Image src="/Voyager-Horizontal-Dark-Strapline.svg" maxH={'45px'} />
        </Box>
        <Box>
          <Flex
            h={'100%'}
            w={'100%'}
            gap={'2rem'}
          >
            <CustomLink to={"/blocks"} label="Blocks" />
            <CustomLink to={"/transactions"} label="Transactions" />
          </Flex>
        </Box>
        <Box></Box>
      </Flex>
    </Container>
  )
}

export default Navbar
