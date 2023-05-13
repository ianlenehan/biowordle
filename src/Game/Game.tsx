import { useState, useCallback, useEffect } from "react";
import {
  Button,
  Flex,
  Icon,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useBoolean,
  Text,
  Link,
  HStack,
  Stack,
  Image,
  useToast,
} from "@chakra-ui/react";
import {
  MdHelpOutline,
  MdBarChart,
  MdOutlineAccountCircle,
} from "react-icons/md";
import { BsTwitter } from "react-icons/bs";
import { format } from "date-fns";
import {
  Link as RouterLink,
  useLoaderData,
  useNavigate,
} from "react-router-dom";

import { GameBoard } from "./GameBoard";
import { Keyboard } from "./Keyboard";
import { HowToPlay } from "./HowToPlay";
import { useIncorrectWords } from "./useIncorrectWords";
import { useUserPlayed } from "./useUserPlayed";
import { useAuthUser } from "../hooks/useAuthUser";
import { useSaveScore } from "../hooks/useSaveScore";

export enum TileColors {
  green = "rgb(83, 141, 78)",
  yellow = "rgb(181, 159, 59)",
  dark = "rgb(58, 58, 60)",
}

type LoaderData = {
  words: { value: string; date: string }[];
};

type KeyColours = {
  [key: string]: TileColors;
};

const confirmKeyColor = (newColor: TileColors, existingColor: TileColors) => {
  switch (existingColor) {
    case TileColors.green: {
      return TileColors.green;
    }
    case TileColors.yellow: {
      return newColor === TileColors.green
        ? TileColors.green
        : TileColors.yellow;
    }
    default: {
      return newColor;
    }
  }
};

const FORMAT_STRING = "y-L-d";

export const Game = () => {
  const [guessedWord, setGuessedWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [tileColors, setTileColors] = useState<TileColors[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [wrongWordIndices, setWrongWordIndices] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const [keyColours, setKeyColours] = useState<KeyColours>({});

  const navigate = useNavigate();

  const toast = useToast();

  const { user } = useAuthUser();

  useEffect(() => {
    if (user && !user.displayName) {
      navigate("profile");
    }
  }, [navigate, user]);

  const { saveScore } = useSaveScore();

  const [isShowingResult, setShowingResult] = useBoolean();
  const [isShowingLosingModal, setShowLosingModal] = useBoolean();
  const [isShowingHelp, setHelp] = useBoolean();
  const [isSubmitting, setSubmitting] = useBoolean();

  const { words } = useLoaderData() as LoaderData;
  console.log("🚀 ~ file: Game.tsx:104 ~ Game ~ words:", words);
  const { logIncorrectWord } = useIncorrectWords();

  const currentWord = words.find(
    ({ date }) => date === format(new Date(), FORMAT_STRING)
  );

  if (!currentWord) {
    throw new Error(
      "There is no word set for today. Please contact game admin!"
    );
  }

  const hasUserPlayedToday = useUserPlayed(currentWord.value);

  const loadGameState = useCallback(() => {
    const gameStateString = window.localStorage.getItem("gameState");
    if (!gameStateString) {
      return;
    }

    const gameState = JSON.parse(gameStateString);
    if (gameState?.currentWordValue !== currentWord.value) {
      window.localStorage.removeItem("gameState");
      return;
    }

    setGuessedLetters(gameState.guessedLetters);
    setTileColors(gameState.tileColors);
    setKeyColours(gameState.keyColours || {});
  }, [currentWord]);

  const storeGameState = useCallback(
    (tileColors: TileColors[]) => {
      if (!guessedLetters.length) {
        return;
      }

      const storedGameState = window.localStorage.getItem("gameState");
      const gameState = {
        currentWordValue: currentWord.value,
        guessedLetters,
        tileColors,
        keyColours,
      };

      const gameStateString = JSON.stringify(gameState);
      if (gameStateString === storedGameState) {
        return;
      }

      window.localStorage.setItem("gameState", JSON.stringify(gameState));
    },
    [currentWord, guessedLetters, keyColours]
  );

  useEffect(() => {
    loadGameState();
  }, [loadGameState]);

  const handleDelete = useCallback(() => {
    if (gameOver || hasUserPlayedToday) return;

    setGuessedWord((prevWord) => prevWord.slice(0, -1));
    setGuessedLetters((prevArr) => prevArr.slice(0, -1));
  }, [gameOver, hasUserPlayedToday]);

  const calculateScore = () => {
    const numberOfCharacters = currentWord.value.length;
    const numberOfGuesses = guessedLetters.length / numberOfCharacters;
    const triesRemaining = 6 - numberOfGuesses;

    const newScore = numberOfCharacters * (triesRemaining + 1);
    setScore(newScore);
    saveScore(newScore, currentWord.value);
  };

  const showResult = () => {
    calculateScore();
    setShowingResult.on();
  };

  const triggerRowAnimation = () => {
    setWrongWordIndices([
      guessedLetters.length - (1 + currentWord.value.length),
      guessedLetters.length - 1,
    ]);

    setTimeout(() => setWrongWordIndices([]), 1000);
  };

  const getIndicesOfLetter = (letter: string, arr: string[]) => {
    const indices = [];
    let idx = arr.indexOf(letter);
    while (idx != -1) {
      indices.push(idx);
      idx = arr.indexOf(letter, idx + 1);
    }
    return indices;
  };

  const getTileColor = (letter: string, index: number) => {
    const isCorrectLetter = currentWord?.value
      ?.toUpperCase()
      .includes(letter.toUpperCase());

    if (!isCorrectLetter) {
      return { letter, tileColor: TileColors.dark };
    }

    const letterInThatPosition = currentWord?.value.charAt(index).toUpperCase();
    const isCorrectPosition = letter.toUpperCase() === letterInThatPosition;

    if (isCorrectPosition) {
      return { letter, tileColor: TileColors.green };
    }

    const isGuessedMoreThanOnce =
      guessedWord.split("").filter((l) => l === letter).length > 1;

    if (!isGuessedMoreThanOnce) {
      return { letter, tileColor: TileColors.yellow };
    }

    const existsMoreThanOnce =
      currentWord.value.split("").filter((l) => l === letter).length > 1;

    const hasBeenGuessedAlready = guessedWord.split("").indexOf(letter) < index;

    const indices = getIndicesOfLetter(letter, currentWord.value.split(""));
    const otherIndices = indices.filter((i) => i !== index);
    const isGuessedCorrectlyLater = otherIndices.some(
      (i) => i > index && guessedWord.split("")[i] === letter
    );

    if (isGuessedCorrectlyLater && !existsMoreThanOnce) {
      return { letter, tileColor: TileColors.dark };
    }

    if (hasBeenGuessedAlready && !existsMoreThanOnce) {
      return { letter, tileColor: TileColors.dark };
    }

    return { letter, tileColor: TileColors.yellow };
  };

  const checkIsWordFromLibrary = (word: string) => {
    const isAlreadyUsed = words?.some(
      ({ value }) => value?.toUpperCase() === word.toUpperCase()
    );

    return isAlreadyUsed;
  };

  const checkIsWordFromDictionary = async (word: string) => {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
    );

    return res.ok;
  };

  const handleSubmit = async () => {
    if (hasUserPlayedToday || gameOver || isSubmitting) return;

    if (guessedWord.length !== currentWord?.value.length) {
      toast({
        title: "Not enough letters",
        status: "warning",
        duration: 4000,
        position: "top",
      });
      return;
    }

    setSubmitting.on();
    const isWordFromLibrary = checkIsWordFromLibrary(guessedWord);
    if (!isWordFromLibrary) {
      const isWordFromDisctionary = await checkIsWordFromDictionary(
        guessedWord
      );

      if (!isWordFromDisctionary) {
        logIncorrectWord(guessedWord, currentWord?.value);
        toast({
          title: "Not in word list",
          status: "error",
          duration: 4000,
          position: "top",
        });

        triggerRowAnimation();
        setSubmitting.off();
        return;
      }
    }

    const interval = 200;
    const colors = guessedWord
      .split("")
      .map((letter, index) => getTileColor(letter, index));

    let i = 0;
    const timer = setInterval(() => {
      const { letter, tileColor } = colors[i] || {};
      if (!tileColor) {
        i = 0;
        clearInterval(timer);
        return;
      }

      setTileColors((prevColors) => [...prevColors, tileColor]);
      setKeyColours((c) => ({
        ...c,
        [letter]: confirmKeyColor(tileColor, c[letter]),
      }));
      i++;
    }, interval);

    const newTileColors = colors.map(({ tileColor }) => tileColor);
    storeGameState([...tileColors, ...newTileColors]);

    if (guessedWord.toUpperCase() === currentWord?.value?.toUpperCase()) {
      setTimeout(() => {
        showResult();
        setGameOver(true);
        setSubmitting.off();
      }, interval * (currentWord.value.length + 1));
    } else if (guessedLetters.length === currentWord.value.length * 6) {
      setTimeout(() => {
        setShowLosingModal.on();
        setGuessedWord("");
        setGameOver(true);
        setSubmitting.off();
      }, interval * (currentWord.value.length + 1));
    } else {
      setSubmitting.off();
      setGuessedWord("");
    }
  };

  const handleLetterSelect = (letter: string) => {
    if (!currentWord?.value || hasUserPlayedToday || gameOver) {
      return;
    }

    if (!guessedWord || guessedWord.length < currentWord.value.length) {
      setGuessedWord((prevWord) => prevWord + letter);
      setGuessedLetters((currentLetters) => [...currentLetters, letter]);
    }
  };

  return (
    <>
      <Flex
        bgColor="rgb(18, 18, 19)"
        alignItems="center"
        flexDirection="column"
        minHeight="100vh"
        width="100%"
      >
        <Flex
          alignItems="center"
          maxWidth="500px"
          height="100%"
          flexDirection="column"
          width="90%"
        >
          <Flex
            alignItems="center"
            justifyContent="space-between"
            borderBottom="1px solid rgb(58, 58, 60)"
            width="100%"
            padding="12px"
          >
            <Icon
              as={MdHelpOutline}
              color="#fff"
              boxSize="24px"
              onClick={setHelp.on}
              cursor="pointer"
            />
            <Heading as="h1" color="#fff" margin="0">
              BioWordle
            </Heading>
            <HStack>
              <Icon
                as={MdOutlineAccountCircle}
                color={user ? "#fff" : "red.300"}
                boxSize="24px"
                onClick={() => navigate("/profile")}
                cursor="pointer"
              />
              <Icon
                as={MdBarChart}
                color="#fff"
                boxSize="24px"
                onClick={() => navigate("/leaderboard")}
                cursor="pointer"
              />
            </HStack>
          </Flex>
          {hasUserPlayedToday && (
            <Text color="red.300">You have already played today!</Text>
          )}
          <Flex
            alignItems="center"
            flexDir="column"
            flex={1}
            justifyContent="space-between"
            width="100%"
          >
            <GameBoard
              wordLength={currentWord?.value?.length || 5}
              {...{ guessedLetters, tileColors, wrongWordIndices }}
            />
            <Keyboard
              onLetterSelect={handleLetterSelect}
              onEnter={handleSubmit}
              onDelete={guessedWord ? handleDelete : undefined}
              {...{ keyColours }}
            />
          </Flex>
        </Flex>
        <a href="https://puresoluble.com/" target="_blank" rel="noreferrer">
          <Image src="Pur_Logo_TM.png" width="200px" />
        </a>
      </Flex>

      <Modal isOpen={isShowingResult} onClose={setShowingResult.off}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Congrats!</ModalHeader>
          <ModalCloseButton />
          <ModalBody marginBottom="36px">
            <Stack spacing="16px">
              <Text>
                You successfully guessed {"today's"} word{" "}
                <Text as="span" fontWeight="bold">
                  {currentWord.value}
                </Text>
                , earning yourself {score} points!
              </Text>
              <Text>Check back tomorrow to play the next word.</Text>

              {!user && (
                <Text>
                  If you want to keep track of your scores and compete with
                  other BioWordle users, why not create an account?{" "}
                  <Link as={RouterLink} to="/profile" color="#2cb0eb">
                    Click here
                  </Link>{" "}
                  to set it up.
                </Text>
              )}

              <Button
                as={Link}
                bgColor="blue.300"
                color="#fff"
                _hover={{ bgColor: "blue.400" }}
                rightIcon={<BsTwitter />}
                href={`https://twitter.com/intent/tweet?text=I%20scored%20${score}%20points%20in%20today's%20BioWordle.`}
                target="_blank"
              >
                Share to Twitter
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isShowingLosingModal} onClose={setShowLosingModal.off}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Too bad!</ModalHeader>
          <ModalCloseButton />
          <ModalBody marginBottom="36px">
            <Text marginBottom="24px">
              Great effort but unfortunately you did not guess the correct word
              today, which was{" "}
              <Text as="span" fontWeight="bold">
                {currentWord.value}
              </Text>
              .
            </Text>
            <Text marginBottom="24px">
              Check back tomorrow to play the next word.
            </Text>

            {!user && (
              <Text>
                If you want to keep track of your scores and compete with other
                BioWordle users, why not create an account?{" "}
                <Link as={RouterLink} to="/profile">
                  Click here
                </Link>{" "}
                to set it up.
              </Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <HowToPlay isOpen={isShowingHelp} onClose={setHelp.off} />
    </>
  );
};
