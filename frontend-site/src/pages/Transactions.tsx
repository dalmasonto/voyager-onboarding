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
import { shortString } from "../utils";
import CustomLink from "../components/CustomLink";
import { Helmet } from 'react-helmet'
import { IPageSize } from "@voyager/common";
import Pagination from "../components/Pagination";

const Transactions: React.FC = () => {
  let [searchParams] = useSearchParams({ ps: '10', p: '1' });

  const pageSizeParam = searchParams.get('ps');
  const pageParam = searchParams.get('p') ?? '1';

  const _ipageSize: IPageSize = Number(pageSizeParam) as IPageSize ?? 10;


  const { data, error, isLoading } = API.useTransactions({ ps: _ipageSize, p: pageParam })

  let totalPages = data?.meta?.totalPages as number


  return (
    <>
      <Helmet>
        <title>{`Transactions`}</title>
      </Helmet>
      <Stack>
        {
          isLoading
            ? <Spinner />
            : error
              ? <Stack>
                <Text>{error?.message ?? "Failed to fetch Transactions"}</Text>
              </Stack>
              : <Stack>
                <Heading textAlign={'center'} as={'h1'}>Transactions</Heading>
                <TableContainer>
                  <Table variant='simple'>
                    <TableCaption>Latest Transactions on voyager</TableCaption>
                    <Thead>
                      <Tr>
                        <Th>Hash</Th>
                        <Th w={'300px'}>Block Number</Th>
                        <Th>Type</Th>
                        <Th>Sender</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {
                        data?.transactions?.map(transaction => {
                          return <Tr>
                            <Th>
                              <CustomLink to={`/transactions/${transaction.transaction_hash}`} label={shortString(transaction.transaction_hash)} />
                            </Th>
                            <Th>
                              {transaction.block_number}
                            </Th>
                            <Th>
                              <Tag colorScheme="green">
                                {transaction.type}
                              </Tag>
                            </Th>
                            <Th>{shortString(transaction.sender_address)}</Th>
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

export default Transactions
