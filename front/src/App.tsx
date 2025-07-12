import { Route, Routes } from "react-router-dom";

import { PUBLIC_ROUTES, APP_ROUTES } from "./routes/route";
import Layout from "./components/layout/Layout";
import { NotFoundPage } from "./components/pages/NotFoundPage";
import PublicGuard from "./routes/PublicGuard";
import AppGuard from "./routes/AppGuard";

function App() {
  return (
    <>
      <Routes>
        <Route element={<PublicGuard />}>
          {Object.values(PUBLIC_ROUTES).map(({ path, element: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Route>
        <Route element={<AppGuard />}>
          <Route element={<Layout />}>
            {Object.values(APP_ROUTES).map(({ path, element: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
