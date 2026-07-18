// Importing the crypto-browserify polyfill for Web Crypto API
// import * as crypto from 'crypto-browserify';

import axios from 'axios';
import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import App from './app';
import { installAuthGuard } from './utils/session';

// ----------------------------------------------------------------------

// Global session guard: any 401 from our API => clean logout + redirect,
// instead of the app crashing on an expired token.
installAuthGuard(axios);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <HelmetProvider>
    <BrowserRouter>
      <Suspense>
        <App />
      </Suspense>
    </BrowserRouter>
  </HelmetProvider>
);
