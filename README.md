## react-router-auth-plus

## Introduce

Make you easy to use permission management based on react-router v6.

## Install

```shell
npm install react-router-auth-plus

OR

yarn add react-router-auth-plus
```

## Usage

if user auth is `["auth1"]`, home router auth configure `["auth1", "auth2"]`, will be judged as having permission.

**How to use(two ways)**

```jsx
// in array
// auth: string | string[]
const routers = [{ path: "/home", element: <Home />, auth: ["admin"] }];

// in jsx
// auth: string | string[]
<AuthRoute path="/home" element={<Home />} auth={["admin"]} />;
```

**Configure the routes**

```jsx
// routers.tsx

import Login from "./pages/Login";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Layout from "./layout/Layout";
import Setting from "./pages/Setting";
import Application from "./pages/Application";
import { Navigate } from "react-router-dom";
import {
  createAuthRoutesFromChildren,
  AuthRoute,
} from "react-router-auth-plus";

const routers: AuthRouterObject[] = [
  { path: "/", element: <Navigate to="/home" replace /> },
  { path: "/login", element: <Login /> },
  {
    element: <Layout />,
    children: [
      { path: "/home", element: <Home />, auth: ["admin"] },
      { path: "/setting", element: <Setting /> },
      {
        path: "/application",
        element: <Application />,
        auth: ["application"],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
];

// or use jsx
const routers: AuthRouterObject[] = createAuthRoutesFromChildren(
  <Routes>
    <AuthRoute path="/" element={<Navigate to="/home" replace />} />
    <AuthRoute path="/login" element={<Login />} />
    <AuthRoute element={<Layout />}>
      <AuthRoute path="/home" element={<Home />} auth={["admin"]} />
      <AuthRoute path="/setting" element={<Setting />} />
      <AuthRoute
        path="/application"
        element={<Application />}
        auth={["application"]}
      />
    </AuthRoute>
    <AuthRoute path="*" element={<NotFound />} />
  </Routes>
);
```

**In App.tsx**

```jsx
// App.tsx

import Loading from "./components/Loading";
import NotAuth from "./components/NotAuth";
import {
  AuthRoute,
  AuthRouterObject,
  createAuthRoutesFromChildren,
  useAuthRouters,
} from "react-router-auth-plus";
import useSWR from "swr";
import { Routes } from "react-router-dom";
import routers from "./routers";

const fetcher = async (url: string): Promise<string[]> =>
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(["admin"]);
    }, 2000);
  });

function App() {
  // use swr, react-query or others
  const { data: auth, isValidating } = useSWR("/api/user", fetcher, {
    revalidateOnFocus: false,
  });

  return useAuthRouters({
    auth: auth || [],
    routers,
    noAuthElement: (router) => <NotAuth />,
    render: (element) => (isValidating ? element : <Loading />),
  });
}
```

**Dynamic Menus**

`react-router-auth-plus` automatically passes children to Layout. You do not need to pass children to Layout in the route configuration. If you are using typescript, set the routers type to optional. UseAuthMenus filters out routes that do not have permission.

```jsx
import { useAuthMenus, AuthRouterObject } from "react-router-auth-plus";

interface LayoutProps {
  routers?: AuthRouterObject;
}

const Layout:FC<LayoutProps> = ({ routers }) => {
   const menus = useAuthMenus(routers);

   ...
}
```

## API

**useAuthRouters**
| Property | Description | Type | Required |
| ----------- | ----------------------------- | ------------------------------------------------------ | -------- |
| auth | permissions of the current user | string[] | true |
| noAuthElement | the element that is displayed when has no permissions | (router: AuthRouterObject) => ReactNode | false |
| render | custom render page | (element: ReactElement \| null) => ReactElement \| null | false |
| routers | all routers | AuthRouterObject[] | true |

**createAuthRoutesFromChildren** (children: ReactNode) => AuthRouterObject[]

create routers from jsx style routers

**useAuthMenus** \<T extends AuthRouterObject>(menuRouters: T[]) => T[]

get the menu with permissions
