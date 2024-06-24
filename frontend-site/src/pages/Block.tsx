import React from "react";
import { Spinner, Stack, Table, TableCaption, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import API from "../utils/API";
import { useParams } from "react-router-dom";
import { IDataItem } from "../utils/types";
import { convertTsToReadableTime, replaceText } from "../utils";
import { Helmet } from 'react-helmet'

const DataItem = ({ label, value }: IDataItem) => {

  const getRenderValue = () => {
    if (label === 'timestamp') {
      return convertTsToReadableTime(value.toString())
    }
    else if (label.startsWith('l1_data') || label.startsWith('l1_gas')) {
      return new Intl.NumberFormat('en-Us').format(parseInt(value.toString(), 16))
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
        <Text fontSize={'sm'}>
          {getRenderValue()}
        </Text>
      </Td>
    </Tr>
  )
}

const Block: React.FC = () => {

  const { blockNumber } = useParams()

  const { data, error, isLoading } = API.useBlock(blockNumber)

  return (
    <>
      <Helmet>
        <title>{`Block ${blockNumber}`}</title>
      </Helmet>
      <Stack>
        {
          isLoading
            ? <Spinner />
            : error
              ? <Stack>
                <Text color={"red"}>{error?.status}</Text>
                <Text color={"red"}>{error?.message}</Text>
              </Stack>
              : <Stack >
                <Text>Block {blockNumber}</Text>
                <TableContainer>
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
                    <TableCaption>Block Details</TableCaption>
                    <Thead>
                      <Tr>
                        <Th>Label</Th>
                        <Th>Value</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {
                        Object.keys(data as any).map((it: any, i: number) => (
                          <DataItem key={`item_${i}_${blockNumber}`} label={it} value={(data as any)[it]} />
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

export default Block
