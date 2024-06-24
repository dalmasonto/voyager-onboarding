import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Blocks from "./pages/Blocks";
import Transactions from "./pages/Transactions";
import Block from "./pages/Block";
import Transaction from "./pages/Transaction";
import ErrorBoundary from "./components/ErrorBoundary";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "blocks",
        element: <Blocks />,
        errorElement: <ErrorBoundary />
      },
      {
        path: "block/:blockNumber",
        element: <Block />,
        errorElement: <ErrorBoundary />
      },
      {
        path: "transactions",
        element: <Transactions />,
        errorElement: <ErrorBoundary />
      },
      {
        path: "transactions/:tx_hash",
        element: <Transaction />,
        errorElement: <ErrorBoundary />
      },
    ]
  },
]);

export default router
