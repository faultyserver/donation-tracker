import React from 'react';
import ReactDOM from 'react-dom';
import {Provider, useDispatch} from 'react-redux';

import ErrorBoundary from '../public/errorBoundary';
import ThemeProvider from '../public/uikit/ThemeProvider';
import Donate from './Donate';
import * as IncentiveActions from './IncentiveActions';
import {store} from './reducer';

/*
  AppInitializer acts as a proxy for bringing the preloaded props provided
  directly by the page on load into the Redux store for the app to run.
  Effectively, this simulates componentDidMount API requests for the same
  information, and is here to abstract that implementation to make conversion
  to a fully-API-powered frontend easier later on.
*/
const AppInitializer = (props) => {
  const {
    incentives
  } = props;

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(IncentiveActions.loadIncentives(incentives));
  }, [dispatch, props]);

  return null;
};


window.DonateApp = function(props) {
  ReactDOM.render(
    <Provider store={store}>
      <AppInitializer {...props} />
      <ThemeProvider>
        <ErrorBoundary>
          <Donate {...props} />
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>,
    document.getElementById('container')
  );
}
