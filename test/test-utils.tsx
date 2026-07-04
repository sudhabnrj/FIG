import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { makeStore, RootState } from '../src/store/appStore';

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = makeStore(preloadedState),
    ...renderOptions
  }: {
    preloadedState?: Partial<RootState>;
    store?: ReturnType<typeof makeStore>;
    [key: string]: any;
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
