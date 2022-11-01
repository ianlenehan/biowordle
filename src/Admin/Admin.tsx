import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import {
  Button,
  Center,
  Input,
  Text,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { format } from "date-fns";
import "react-calendar/dist/Calendar.css";

import { useGetWords } from "../hooks/useGetWords";
import { useSaveWord } from "./useSaveWord";

const FORMAT_STRING = "y-L-d";

export const Admin = () => {
  const [date, setDate] = useState(new Date());
  const [word, setWord] = useState("");

  const toast = useToast();

  const { words, refetch } = useGetWords();
  const { saveWord, isSaving } = useSaveWord();

  useEffect(() => {
    if (!words?.length) {
      return;
    }

    const dateString = format(date, FORMAT_STRING);
    const selectedWord = words.find(({ date }) => date === dateString);
    setWord(selectedWord?.value || "");
  }, [date, words]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWord(event.target.value);
  };

  const handleSaveWord = async () => {
    try {
      const dateString = format(date, FORMAT_STRING);
      // if (isPast(date) || isToday(date)) {
      //   throw new Error("Can only change words for future dates");
      // }
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
      <div>Admin PAGE</div>

      <Calendar onChange={setDate} value={date} />

      <Text>{format(date, "do LLL")}</Text>
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
    </Center>
  );
};