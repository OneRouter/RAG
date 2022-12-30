import { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "@onerouter/core";
import useSWR from "swr";
import "./App.css";
import "antd/dist/reset.css";
import NotAuth from "./pages/403";
import Loading from "./components/Loading";
import { getAuthRouters } from "../lib";
import { routers } from "./routers";

const fetcher = async (url: string): Promise<string[]> =>
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(["admin"]);
    }, 1000);
  });

function App() {
  const { data: auth, isValidating } = useSWR("/api/user", fetcher, {
    // close fetch on window focus
    revalidateOnFocus: false,
  });

  const _routers = getAuthRouters({
    routers,
    noAuthElement: (router) => <NotAuth />,
    render: (element) => (isValidating ? <Loading /> : element),
    auth: auth || [],
  });

  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider
        router={createBrowserRouter(_routers)}
        // route loader loading
        fallbackElement={<Loading />}
      />
    </Suspense>
  );
}

export default App;
