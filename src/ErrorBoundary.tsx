import { useRouteError, Link as RouterLink } from "react-router-dom";
import {
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
  Link,
} from "@chakra-ui/react";

export const ErrorBoundary = () => {
  const error = useRouteError() as { error: unknown };

  let errorMessage = "Something went wrong.";
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <Center display="flex" flexDirection="column">
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Oops!
        </AlertTitle>
        <AlertDescription maxWidth="sm">{errorMessage}</AlertDescription>
      </Alert>
      <Text marginY="36px">
        Are you an admin?{" "}
        <Link as={RouterLink} to="profile">
          Click here to login
        </Link>
        .
      </Text>
    </Center>
  );
};
