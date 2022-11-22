import { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import {
  Button,
  Flex,
  Center,
  Input,
  Text,
  HStack,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { format, isPast, isToday } from "date-fns";
import "react-calendar/dist/Calendar.css";

import { BackButton } from "../BackButton";
import { useGetWords } from "../hooks/useGetWords";
import { useSaveWord } from "./useSaveWord";
import { useGetAverageScore } from "./useGetAverageScore";
import { useIncorrectlyGuessedWords } from "./useIncorrectlyGuessedWords";

const FORMAT_STRING = "y-L-d";

export const Admin = () => {
  const [date, setDate] = useState(new Date());
  const [word, setWord] = useState("");
  const [averageScore, setAverageScore] = useState(0);

  const toast = useToast();

  const { words, refetch } = useGetWords();
  const { saveWord, isSaving } = useSaveWord();
  const { getAverageOfWord } = useGetAverageScore();
  const { incorrectlyGuessedWords } = useIncorrectlyGuessedWords();

  useEffect(() => {
    if (!words?.length) {
      return;
    }

    const dateString = format(date, FORMAT_STRING);
    const selectedWord = words.find(({ date }) => date === dateString);
    setWord(selectedWord?.value || "");
  }, [date, words]);

  const setAverage = useCallback(async () => {
    const average = await getAverageOfWord(word);
    setAverageScore(average);
  }, [getAverageOfWord, word]);

  useEffect(() => {
    if (!isPast(date) || !word) {
      return;
    }

    console.log("calling/");

    setAverage();
  }, [date, word, setAverage]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWord(event.target.value);
  };

  const handleSaveWord = async () => {
    try {
      const dateString = format(date, FORMAT_STRING);
      if (isPast(date) || isToday(date)) {
        throw new Error("Can only change words for future dates");
      }
      await saveWord(word, dateString);
      refetch();

      toast({
        title: "Word saved",
        status: "success",
        isClosable: true,
      });
    } catch (e) {
      if (e instanceof Error) {
        toast({
          title: e.message,
          status: "error",
          isClosable: true,
        });
      }
    }
  };

  return (
    <Center display="flex" flexDirection="column">
      <Stack spacing="24px">
        <Text fontWeight="bold" fontSize="4xl" textAlign="center">
          BioWordle Admin
        </Text>
        <BackButton color="gray.700" />
        <Calendar onChange={setDate} value={date} />
        <Text>Word for {format(date, "do LLLL")}:</Text>
        <HStack>
          <Input value={word} onChange={handleChange} />
          <Button
            colorScheme="blue"
            onClick={handleSaveWord}
            isLoading={isSaving}
          >
            Save
          </Button>
        </HStack>
        {averageScore && <Text>Average Score: {averageScore}</Text>}
        <Stack>
          <Text fontWeight="bold">Incorrectly guessed words: </Text>
          <Flex wrap="wrap" gap="6px">
            {incorrectlyGuessedWords.map((item) => (
              <Text as="span" key={item.id}>
                {item.guessedWord}
              </Text>
            ))}
          </Flex>
        </Stack>
      </Stack>
    </Center>
  );
};
