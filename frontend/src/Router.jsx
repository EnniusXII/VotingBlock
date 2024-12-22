import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreateSessionPage from "./pages/CreateSessionPage";
import VotingSessionsPage from "./pages/VotingSessionsPage";
import SessionPage from "./pages/SessionPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage/>,
    },
    {
        path: "/create",
        element: <CreateSessionPage/>,
    },
    {
        path: "/sessions",
        element: <VotingSessionsPage/>,
    },
    {
        path: "/sessions/:sessionId",
        element: <SessionPage/>,
    }
]);