import React, { useEffect, useRef, useState } from "react";
import { Box, Button, ButtonGroup, Flex, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Select, Spinner, Stack, Tag, Text } from "@chakra-ui/react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react'
import API from "../utils/API";
import { useSearchParams } from "react-router-dom";
import { convertTsToReadableTime, isValidPageSize, PageSizeArray, shortString } from "../utils";
import CustomLink from "../components/CustomLink";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { Helmet } from 'react-helmet'
import { IPageSize } from "@voyager/common";

const Blocks: React.FC = () => {
  let [searchParams, setSearchParams] = useSearchParams();
  const [pageSize, setPageSize] = useState(searchParams.get('ps') ?? '10')
  const [page, setPage] = useState(searchParams.get('p') ?? '0')

  const pageSizeParam = searchParams.get('ps');
  const pageParam = searchParams.get('p') ?? '0';
  const _ipageSize: IPageSize = isValidPageSize(pageSizeParam ?? '10') ? (pageSizeParam as IPageSize) : '10';


  const { data, error, isLoading } = API.useBlocks({ ps: _ipageSize, p: pageParam })
  const goToPageRef: any = useRef()

  const goToPage = () => {
    let page_ = goToPageRef?.current?.value
    console.log(page_)
    let totalPages = data?.meta?.totalPages as number
    if (Number(page_) > totalPages) {
      setPage(totalPages.toString() ?? '0')
    } else {
      setPage(page_?.toString() ?? '0')
    }
  }

  const goToNextPage = () => {
    const nextPage = Number(page) + 1;
    let totalPages = data?.meta?.totalPages as number
    if (nextPage > totalPages) {
      setPage(totalPages.toString())
    } else {
      setPage(nextPage.toString())
    }
  }

  useEffect(() => {
    let params = {
      ps: (!pageSize || pageSize === '') ? '10' : pageSize,
      p: searchParams.get('p') ?? '0'
    }
    setSearchParams(params)
  }, [pageSize])

  useEffect(() => {
    let params = {
      ps: searchParams.get('ps') ?? '10',
      p: (!page || page === '') ? '0' : page,
    }
    setSearchParams(params)
  }, [page])

  return (
    <>
      <Helmet>
        <title>{`Blocks`}</title>
      </Helmet>
      <Stack>
        {
          isLoading
            ? <Spinner />
            : error
              ? <Stack>
                <Text>{error?.message ?? "Failed to fetch blocks"}</Text>
              </Stack>
              : <Stack>
                <Text>Blocks</Text>
                <TableContainer>
                  <Table variant='simple'>
                    <TableCaption>Latest Blocks on voyager</TableCaption>
                    <Thead>
                      <Tr>
                        <Th>No.</Th>
                        <Th>Block Hash</Th>
                        <Th>Status</Th>
                        <Th>TimeStamp</Th>
                        <Th>Starknet Version</Th>
                        <Th>L1 DA Mode</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {
                        data?.blocks?.map(block => {
                          return <Tr>
                            <Th>{block.block_number}</Th>
                            <Th>
                              <CustomLink to={`/block/${block.block_number}`} label={shortString(block.block_hash)} />
                            </Th>
                            <Th>
                              <Tag colorScheme="green">
                                {block.status}
                              </Tag>
                            </Th>
                            <Th>{convertTsToReadableTime(block.timestamp)}</Th>
                            <Th><Tag colorScheme={"blue"}>{block.starknet_version}</Tag></Th>
                            <Th><Tag colorScheme={"blue"}>{block.l1_da_mode}</Tag></Th>
                          </Tr>
                        })
                      }
                    </Tbody>
                  </Table>
                </TableContainer>
                <Box>
                  <Flex justify={'space-between'}>
                    <Select placeholder='Page size' width={'fit-content'} value={pageSize} onChange={e => setPageSize(e.currentTarget.value)}>
                      {
                        PageSizeArray.map((it) => (
                          <option value={it} key={`size_${it}`}>{it}</option>
                        ))
                      }
                    </Select>
                    <Flex align={'center'} gap={'10px'}>
                      <ButtonGroup>
                        <Button size={'sm'} bg={'gray.50'} as="button" isDisabled={Number(page) <= 0} onClick={() => setPage((Number(page) - 1).toString())}>
                          <FaChevronLeft strokeWidth="1px" strokeOpacity={0.6} color="rgba(0, 0, 0, 0.7)" />
                        </Button>
                        <Button size={'sm'} bg={'gray.50'} onClick={goToNextPage} isDisabled={(parseInt(page) + 1) > (data?.meta?.totalPages ?? 0)}>
                          <FaChevronRight strokeWidth="1px" strokeOpacity={0.6} color="rgba(0, 0, 0, 0.7)" />
                        </Button>
                      </ButtonGroup>
                      <Flex align={'center'} gap={'10px'}>
                        <Text>Go To:</Text>
                        <NumberInput w={'100px'} size={'sm'} borderRadius={'md'} defaultValue={page} min={0} max={data?.meta?.totalPages}>
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
                    </Flex>
                  </Flex>
                </Box>
              </Stack>
        }
      </Stack>
    </>
  )
}

export default Blocks

