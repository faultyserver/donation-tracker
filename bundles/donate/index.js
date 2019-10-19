import React from 'react';
import ReactDOM from 'react-dom';

import Donate from './Donate';
import ErrorBoundary from '../public/errorBoundary';
import ThemeProvider from '../public/uikit/ThemeProvider';

window.DonateApp = function(props) {
  ReactDOM.render(
    <ThemeProvider>
      <ErrorBoundary>
        <Donate {...props} />
      </ErrorBoundary>
    </ThemeProvider>,
    document.getElementById('container')
  );
}

