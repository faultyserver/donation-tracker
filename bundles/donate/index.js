import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import Donate from './Donate';
import {store} from './reducer';
import ErrorBoundary from '../public/errorBoundary';
import ThemeProvider from '../public/uikit/ThemeProvider';

window.DonateApp = function(props) {
  ReactDOM.render(
    <Provider store={store}>
      <ThemeProvider>
        <ErrorBoundary>
          <Donate {...props} />
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>,
    document.getElementById('container')
  );
}
