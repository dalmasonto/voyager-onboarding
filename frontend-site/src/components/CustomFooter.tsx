import { Box, Container, Image, Link, List, ListItem, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { IFooterLink } from '../utils/types'

const resourceLinks: IFooterLink[] = [
    {
        label: 'Starknet Ecosystem',
        url: 'https://www.starknet-ecosystem.com/'
    },
    {
        label: "Starknet Architecture",
        url: "https://docs.starknet.io/documentation/architecture_and_concepts/Network_Architecture/starknet_architecture_overview/"
    },
    {
        label: "Starknet Book",
        url: "https://book.starknet.io/"
    },
    {
        label: "Starknet RPC Spec",
        url: "https://github.com/starkware-libs/starknet-specs/blob/master/api/starknet_api_openrpc.json"
    },
    {
        label: "Starknet Community Forum",
        url: "https://community.starknet.io/"
    }
]

const advancedResourceLinks: IFooterLink[] = [
    {
        label: 'Cairo Book',
        url: 'https://book.cairo-lang.org/'
    },
    {
        label: "Starklings Web app",
        url: "https://starklings.app/"
    },
    {
        label: "Starklings CLI tool",
        url: "https://github.com/shramee/starklings-cairo1"
    },
    {
        label: "Starknet By Example",
        url: "https://starknet-by-example.voyager.online/"
    },
    {
        label: "Starknet Remix Plugin",
        url: "https://remix.ethereum.org/#activate=Starknet"
    }
]

const CustomFooter = () => {
    return (
        <Box bg={'gray.50'} py={'40px'}>
            <Container maxW='container.xl'>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 3 }} spacing={4} p={4}>
                    <Box p={'10px'}>
                        <Stack gap={'20px'}>
                            <Image src='/Voyager_Logo_Pack/Voyager_Horizontal/Voyager-Horizontal-Dark.svg' maxW={'200px'} />
                            <Text fontSize={'sm'}>
                                Explore StarkNet with Voyager, your go-to block explorer.
                            </Text>
                        </Stack>
                    </Box>
                    <Box p={'10px'}>
                        <Stack gap={'20px'}>
                            <Text fontWeight={500} color={'gray.800'}>Resources</Text>
                            <List spacing={2}>
                                {
                                    resourceLinks?.map((it, i: number) => (
                                        <ListItem key={`item_${i}`}>
                                            <Link color={'gray.600'} fontSize={'sm'} href={it.url}>
                                                {it.label}
                                            </Link>
                                        </ListItem>
                                    ))
                                }
                            </List>
                        </Stack>
                    </Box>
                    <Box p={'10px'}>
                        <Stack gap={'20px'}>
                            <Text fontWeight={500} color={'gray.800'}>Advanced Resources</Text>
                            <List spacing={2}>
                                {
                                    advancedResourceLinks?.map((it, i: number) => (
                                        <ListItem key={`item_${i}`}>
                                            <Link color={'gray.600'} fontSize={'sm'} href={it.url}>
                                                {it.label}
                                            </Link>
                                        </ListItem>
                                    ))
                                }
                            </List>
                        </Stack>
                    </Box>
                </SimpleGrid>
            </Container>
        </Box>
    )
}

export default CustomFooter