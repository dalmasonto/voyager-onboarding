import { Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react";
import { useRouteError } from "react-router-dom";


const ErrorBoundary = () => {
    let error = useRouteError();
    return (
        <div>
            <Alert status='error' borderRadius={'10px'} flexDirection='column'>
                <AlertIcon />
                <AlertTitle>An Error Occurred!</AlertTitle>
                <AlertDescription>
                    {error?.toString()}
                </AlertDescription>
            </Alert>
        </div>
    )
}

export default ErrorBoundary