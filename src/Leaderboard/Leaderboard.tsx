import {
  Text,
  Flex,
  Stack,
  Thead,
  Th,
  TableContainer,
  Table,
  Tbody,
  Tr,
  Td,
  IconButton,
  Icon,
  HStack,
} from "@chakra-ui/react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { useLeaderboard } from "./useLeaderboard";
import { BackButton } from "../BackButton";

export const Leaderboard = () => {
  const { allTime, monthly, monthName, setPreviousMonth, setNextMonth } =
    useLeaderboard();

  return (
    <Flex
      justifyContent="center"
      bgColor="gray.700"
      height="100%"
      padding="24px"
      overflowY="auto"
    >
      <Stack spacing="64px">
        <Stack>
          <Text
            color="white"
            fontWeight="bold"
            fontSize="4xl"
            textAlign="center"
          >
            BioWordle Leaderboard
          </Text>
          <BackButton />
        </Stack>

        <div>
          <Text
            color="white"
            fontWeight="bold"
            fontSize="3xl"
            textAlign="center"
          >
            All Time Top 10
          </Text>
          <TableContainer width={["100%", "600px"]}>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color="gray.300">User</Th>
                  <Th color="gray.300" isNumeric>
                    Score
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {allTime?.map((score) => (
                  <Tr key={score.userId}>
                    <Td color="gray.100">{score.name || score.email}</Td>
                    <Td color="gray.100" isNumeric>
                      {score.value}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </div>

        <div>
          <HStack justifyContent="center">
            <IconButton
              aria-label="previous month"
              icon={<Icon as={FaAngleLeft} />}
              onClick={setPreviousMonth}
              variant="ghost"
              color="gray.300"
            />
            <Text
              color="white"
              fontWeight="bold"
              fontSize="3xl"
              textAlign="center"
            >
              {monthName} Top 10
            </Text>
            <IconButton
              aria-label="next month"
              icon={<Icon as={FaAngleRight} />}
              onClick={setNextMonth}
              variant="ghost"
              color="gray.300"
            />
          </HStack>
          <TableContainer width={["100%", "600px"]}>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color="gray.300">User</Th>
                  <Th color="gray.300" isNumeric>
                    Score
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {monthly?.map((score) => (
                  <Tr key={score.userId}>
                    <Td color="gray.100">{score.name || score.email}</Td>
                    <Td color="gray.100" isNumeric>
                      {score.value}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </div>
      </Stack>
    </Flex>
  );
};
