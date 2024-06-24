import { Link } from 'react-router-dom'
import { Link as ChakraLink } from '@chakra-ui/react'
import { ICustomLink } from '../utils/types'


const CustomLink = ({ to, label }: ICustomLink) => {
    return (
        <ChakraLink as={Link} to={to} color={'blue'} fontWeight={500}>
            {label}
        </ChakraLink>
    )
}

export default CustomLink