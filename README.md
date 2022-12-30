# Router Auth Guard

Easy to use permission management based on react-router v6 (forked from [linxianxi/react-router-auth-plus](https://github.com/linxianxi/react-router-auth-plus) to import from react-router instead of react-router-dom).

## Install

```shell
npm install @onerouter/rag

OR

yarn add @onerouter/rag
```

## Usage

if user auth is `["auth1"]`, home router auth configure `["auth1", "auth2"]`, will be judged as having permission.

**How to use**

```jsx
// auth: string | string[]
const routers = [{ path: "/home", element: <Home />, auth: ["admin"] }];
```

**Configure the routes**

```jsx
// routers.tsx
import { lazy } from "react";
import { Navigate } from "@onerouter/core";
import { AuthRouteObject } from "@onerouter/rag";

const Layout = lazy(() => import("./layout/Layout"));
const Application = lazy(() => import("./pages/Application"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/404"));
const Setting = lazy(() => import("./pages/Setting"));

export const routers: AuthRouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    // it will pass th routers prop to Layout
    // genRoutersProp: true,
    // it will pass the authRouters prop to Layout, you can use it to generate menus
    genAuthRoutersProp: true,
    children: [
      {
        element: <Home />,
        auth: ["admin"],
        index: true,
      },
      {
        path: "/setting",
        element: <Setting />,
      },
      {
        path: "/application",
        element: <Application />,
        auth: ["application"],
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  { path: "*", element: <NotFound /> },
];
```

With [@onerouter/core](https://npmjs.com/package/@onerouter/core), you can choose two ways to render routers

1、you can use RouterProvider and createRouter

```jsx
// App.tsx
import { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "@onerouter/core";
import { getAuthRouters } from "@onerouter/rag";
import useSWR from "swr";
import NotAuth from "./pages/403";
import Loading from "./components/Loading";
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
        router={createRouter(_routers)}
        // route loader loading
        fallbackElement={<Loading />}
      />
    </Suspense>
  );
}

export default App;
```

2、you can use `Router` to wrap `<App />`

```jsx
import { useRoutes } from "@onerouter/core";
import { getAuthRouters } from "@onerouter/rag";
import useSWR from "swr";
import NotAuth from "./pages/403";
import Loading from "./components/Loading";
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

  return useRoutes(
    getAuthRouters({
      routers,
      noAuthElement: (router) => <NotAuth />,
      render: (element) => (isValidating ? <Loading /> : element),
      auth: auth || [],
    })
  );
}

export default App;
```

```jsx
// main.tsx(vite) or index.tsx(create-react-app)
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Router>
    <App />
  </Router>
);
```

**Dynamic Menus**

If you set `genRoutersProp` and `genAuthRoutersProp` in router config, `@onerouter/rag` automatically passes `routers` and `authRouters` to props.

```jsx
// Layout.tsx
import { FC } from "react";
import { AuthRouteObject } from "@onerouter/rag";

interface LayoutProps {
  // children routers (if you set genRoutersProp)
  routers?: AuthRouteObject[];
  // children auth routers (if you set genAuthRoutersProp)
  authRouters?: AuthRouteObject[];
}

const Layout:FC<LayoutProps> = ({ routers = [], authRouters = [] }) => {
   // you can use this to generate your menus
   console.log("authRouters", authRouters);
   return ...
}
```

If you want to config menu name and icon in the routes

```jsx
// routers.tsx
type MetaMenu = {
  name?: string,
  icon?: React.ReactNode,
};

export type MetaMenuAuthRouteObject = AuthRouteObject<MetaMenu>;

export const routers: MetaMenuAuthRouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    genAuthRoutersProp: true,
    children: [
      {
        element: <Home />,
        auth: ["admin"],
        index: true,
        name: "home",
        icon: <HomeOutlined />,
      },
      {
        path: "/setting",
        element: <Setting />,
      },
      {
        path: "/application",
        element: <Application />,
        auth: ["application"],
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  { path: "*", element: <NotFound /> },
];
```

```jsx
// Layout.tsx
import { FC } from "react";
import { Outlet } from "@onerouter/core";
import { MetaMenuAuthRouteObject } from "../routers";

interface LayoutProps {
  authRouters?: MetaMenuAuthRouteObject[];
}

const Layout: FC<LayoutProps> = ({ authRouters = [] }) => {
  // you can get name and icon
  console.log("authRouters", authRouters);
  return ...;
};

export default Layout;

```

## API

**getAuthRouters**
| Property | Description | Type | Required |
| ----------- | ----------------------------- | ------------------------------------------------------ | -------- |
| auth | permissions of the current user | string[] | true |
| noAuthElement | the element that is displayed when has no permissions | (router: AuthRouteObject) => ReactNode | false |
| render | custom render page | (element: ReactElement \| null) => ReactElement \| null | false |
| routers | all routers | AuthRouteObject[] | true |
