import { Link, useMatch, useResolvedPath } from 'react-router-dom'
import { Link as ChakraLink } from '@chakra-ui/react'
import { ICustomLink } from '../utils/types'


const CustomLink = ({ to, label }: ICustomLink) => {
    let resolved = useResolvedPath(to);
    let match = useMatch({ path: resolved.pathname, end: true });

    return (
        <ChakraLink as={Link} to={to} color={match ? 'blue' : 'black'}  fontWeight={500}>
            {label}
        </ChakraLink>
    )
}

export default CustomLink