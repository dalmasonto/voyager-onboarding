import React from "react";
import { Box, Heading, Spinner, Stack, Tag, Text } from "@chakra-ui/react";
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
import { convertTsToReadableTime, shortString } from "../utils";
import CustomLink from "../components/CustomLink";
import { Helmet } from 'react-helmet'
import { IPageSize } from "@voyager/common";
import Pagination from "../components/Pagination";

const Blocks: React.FC = () => {
  let [searchParams] = useSearchParams({ ps: '10', p: '1' });


  const pageSizeParam = searchParams.get('ps');
  const pageParam = searchParams.get('p') ?? '1';
  const _ipageSize: IPageSize = Number(pageSizeParam) as IPageSize ?? 10;


  const { data, error, isLoading } = API.useBlocks({ ps: _ipageSize, p: pageParam })

  let totalPages = data?.meta?.totalPages as number

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
                <Heading textAlign={'center'} as={'h1'}>Blocks</Heading>
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
                            <Th>{convertTsToReadableTime(block.timestamp).replace(/, /g, "")}</Th>
                            <Th><Tag colorScheme={"blue"}>{block.starknet_version}</Tag></Th>
                            <Th><Tag colorScheme={"blue"}>{block.l1_da_mode}</Tag></Th>
                          </Tr>
                        })
                      }
                    </Tbody>
                  </Table>
                </TableContainer>
                <Box>
                  <Pagination
                    totalPages={totalPages}
                  />
                </Box>
              </Stack>
        }
      </Stack>
    </>
  )
}

export default Blocks

