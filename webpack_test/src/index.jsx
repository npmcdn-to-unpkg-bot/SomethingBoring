import ReactDOM from 'react-dom';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';

//import from './css/style.scss';
import reducers from './reducers';
import routerConf from './router';

const store = createStore(
  combineReducers({
      ...reducers,
      routing: routerReducer
  })
);
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history} routes={routerConf} />
  </Provider>,
  document.getElementById('root')
);
