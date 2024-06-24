import { Box, Container, Stack } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import { Outlet } from 'react-router-dom'
import "./App.css"
import CustomFooter from './components/CustomFooter'

function App() {
  return (
    <Stack gap={'2rem'}>
      <Navbar />
      <Box minH={'100dvh'}>
        <Container maxW={'container.xl'} >
          <Outlet />
        </Container>
      </Box>
      <CustomFooter />
    </Stack>
  )
}

export default App
