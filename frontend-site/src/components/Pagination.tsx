import { Flex, ButtonGroup, Button, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Text, Select } from '@chakra-ui/react'
import { pageSizeArray } from '@voyager/common/src/common'
import { useEffect, useRef, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useSearchParams } from 'react-router-dom'
// import { PageSizeArray } from '../utils'

interface IPagination {
    totalPages?: number,
}

const Pagination = ({ totalPages }: IPagination) => {

    let [searchParams, setSearchParams] = useSearchParams({ps: '10', p: '1'});
    const [pageSize, setPageSize] = useState(searchParams.get('ps') ?? '10')
    const [page, setPage] = useState(searchParams.get('p') ?? '1')

    const goToPageRef: any = useRef()

    const goToPage = () => {
        let page_ = goToPageRef?.current?.value

        if (Number(page_) > totalPages!!) {
            setPage(totalPages!!.toString() ?? '1')
        } else {
            setPage(page_?.toString() ?? '1')
        }
    }

    const goToNextPage = () => {
        const nextPage = Number(page) + 1;

        if (nextPage > totalPages!!) {
            setPage(totalPages!!.toString())
        } else {
            setPage(nextPage.toString())
        }
    }

    const goToPreviousPage = () => {
        const nextPage = Number(page) - 1;

        if (nextPage < 1) {
            setPage('1')
        } else {
            setPage(nextPage.toString())
        }
    }

    useEffect(() => {
        let params = {
            ps: (!pageSize || pageSize === '') ? '10' : pageSize,
            p: searchParams.get('p') ?? '10'
        }
        setSearchParams(params)
    }, [pageSize])

    useEffect(() => {
        let params = {
            ps: searchParams.get('ps') ?? '10',
            p: (!page || page === '' || page === '0') ? '1' : page,
        }
        setSearchParams(params)
    }, [page])

    useEffect(() => {
        if (Number(page) > totalPages!!) {
            setSearchParams({ ps: searchParams.get('ps') ?? '10', p: totalPages!!.toString() })
            setPage(totalPages!!?.toString())
        }
    }, [totalPages])

    return (
        <div>
            <Flex justify={'space-between'}>
                <Flex align={'center'} gap={'10px'}>
                    <Select fontSize={'14px'} width={'fit-content'} value={pageSize} onChange={e => setPageSize(e.currentTarget.value)}>
                        {
                            pageSizeArray.map((it) => (
                                <option value={it} key={`size_${it}`}>{it}</option>
                            ))
                        }
                    </Select>
                </Flex>
                <Flex align={'center'} gap={'10px'}>
                    <ButtonGroup bg={'gray.50'} gap={0} borderRadius={'50px'}>
                        <Button size={'sm'} p={0} variant={'light'} as="button" isDisabled={Number(page) <= 1} onClick={goToPreviousPage}>
                            <FaChevronLeft strokeWidth="1px" strokeOpacity={0.6} color="rgba(0, 0, 0, 0.7)" />
                        </Button>
                        <Button size={'sm'} p={0} variant={'light'} onClick={goToNextPage} isDisabled={(parseInt(page) + 1) > (totalPages ?? 0)}>
                            <FaChevronRight strokeWidth="1px" strokeOpacity={0.6} color="rgba(0, 0, 0, 0.7)" />
                        </Button>
                    </ButtonGroup>
                    <Popover autoFocus>
                        <PopoverTrigger>
                            <Button variant={'outline'} size={'sm'} borderRadius={'50px'} fontWeight={500}>
                                {
                                    (page !== '0' || !totalPages) ? (
                                        <Text fontSize={'14px'}>
                                            {`Page ${page} of ${totalPages}`}
                                        </Text>
                                    ) : null
                                }
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverHeader>Go to Page</PopoverHeader>
                            <PopoverBody>
                                <Flex align={'center'} gap={'6px'}>
                                    <Text color={'gray.600'} fontSize={'14px'}>Go To</Text>
                                    <NumberInput flex={1} w={'100px'} size={'sm'} borderRadius={'md'} defaultValue={page} min={1} max={totalPages}>
                                        <NumberInputField ref={goToPageRef} borderRadius={'md'} placeholder="Page" />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                    <Button size={'sm'} onClick={goToPage}>
                                        Go
                                    </Button>
                                </Flex>
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
                </Flex>
            </Flex>
        </div>
    )
}

export default Pagination

