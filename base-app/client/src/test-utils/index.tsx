import React, { PropsWithChildren } from "react";
import { render as rtlRender } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";

import type { PreloadedState } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Router } from "react-router-dom";

import type { RootState } from "../app/store";
import { configureStoreWithMiddlewares } from "../app/store";
import { createMemoryHistory, MemoryHistoryBuildOptions } from "history";
// As a basic setup, import your same slice reducers

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: PreloadedState<RootState>;
  store?: any;
  routeHistory?: Array<string>;
  initialRouteIndex?: number; // index in the routeHistory array to start the test
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    routeHistory = [],
    initialRouteIndex,
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  const store = configureStoreWithMiddlewares(preloadedState);
  const memoryHistoryArgs: MemoryHistoryBuildOptions = {};
  if (routeHistory.length > 0) {
    memoryHistoryArgs.initialEntries = routeHistory;
    memoryHistoryArgs.initialIndex = initialRouteIndex;
  }
  const history = createMemoryHistory({ ...memoryHistoryArgs });
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    // Automatically create a store instance if no store was passed in
    return (
      <Provider store={store}>
        <Router history={history}>{children}</Router>
      </Provider>
    );
  }
  const renderResult = rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
  // Return an object with the store and all of RTL's query functions
  return { ...renderResult, store, history };
}

// re-export everything
export * from "@testing-library/react";

// override render method
export { renderWithProviders as render };
