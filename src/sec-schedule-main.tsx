import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SecScheduleApp from './SecScheduleApp';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element with id "root" was not found in the document.');
}

createRoot(rootElement).render(
  <StrictMode>
    <SecScheduleApp />
  </StrictMode>,
);
