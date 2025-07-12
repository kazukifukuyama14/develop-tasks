import { Route, Routes } from "react-router-dom";

import { PUBLIC_ROUTES, APP_ROUTES } from "./routes/route";
import Layout from "./components/layout/Layout";
import { NotFoundPage } from "./components/pages/NotFoundPage";

function App() {
  return (
    <>
      <Routes>
        {Object.values(PUBLIC_ROUTES).map(({ path, element: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route element={<Layout />}>
          {Object.values(APP_ROUTES).map(({ path, element: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
