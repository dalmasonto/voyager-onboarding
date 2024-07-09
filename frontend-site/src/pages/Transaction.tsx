import React from "react";
import { Heading, Spinner, Stack, Table, TableCaption, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import API from "../utils/API";
import { useParams } from "react-router-dom";
import { IDataItem } from "../utils/types";
import { convertTsToReadableTime, replaceText } from "../utils";
import { Helmet } from 'react-helmet'


const DataItem = ({ label, value }: IDataItem) => {

  const getRenderValue = () => {
    if (label === 'timestamp') {
      return convertTsToReadableTime(value.toString()).replace(/, /g, "")
    }
    else if (label === 'signature' || label === 'calldata' || label === 'paymaster_data' || label === 'resource_bounds' || label === 'account_deployment_data') {
      return value === '[]' ? '-' : JSON.stringify(JSON.parse(value.toString()), null, 4)
    }
    else if (value === 'undefined') {
      return '-'
    }
    else if (value === '[]') {
      return '-'
    }
    else if (label.startsWith('max_fee')) {
      return value === 'undefined' ? '-' : new Intl.NumberFormat('en-Us').format(parseInt(value.toString(), 16))
    }
    return value
  }

  return (
    <Tr>
      <Td>
        <Text fontSize={'sm'} fontWeight={500} textTransform={'capitalize'}>
          {replaceText(label, '_', ' ')}
        </Text>
      </Td>
      <Td>
        <Text fontSize={'sm'} style={{ whiteSpace: 'pre-wrap' }}>
          {getRenderValue()}
        </Text>
      </Td>
    </Tr>
  )
}

const Transaction: React.FC = () => {

  const { tx_hash } = useParams()
  console.log("Tx Hash: ", tx_hash)

  const { data, error, isLoading } = API.useTransaction(tx_hash)

  console.log(data)

  return (
    <>
      <Helmet>
        <title>{`Transaction ${tx_hash}`}</title>
      </Helmet>
      <Stack>
        {
          isLoading
            ? <Spinner />
            : error
              ? <Stack>
                <Text color={"red"} textAlign={'center'}>{error?.status}</Text>
                <Text color={"red"} textAlign={'center'}>{error?.message}</Text>
              </Stack>
              : <Stack >
                <Heading textAlign={'center'} as={'h1'}>Transaction</Heading>
                <Text textAlign={'center'}>{tx_hash}</Text>
                <TableContainer alignSelf={'center'}>
                  <Table
                    variant='simple'
                    border="1px solid"
                    borderColor="gray.100"
                    borderRadius="md"
                    display={'table-cell'}
                    // rounded="20px"
                    rounded="md"
                    size={'md'}
                    width={'100%'}
                  >
                    <TableCaption>Transaction Details</TableCaption>
                    <Thead>
                      <Tr>
                        <Th>Label</Th>
                        <Th>Value</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {
                        Object.keys(data as any).map((it: any, i: number) => (
                          <DataItem key={`item_${i}`} label={it} value={(data as any)[it]} />
                        ))
                      }
                    </Tbody>
                  </Table>
                </TableContainer>
              </Stack>
        }
      </Stack>
    </>
  )
}

export default Transaction
