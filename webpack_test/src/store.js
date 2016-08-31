import { createStore, combineReducers } from 'redux'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import reducers from './reducers';
const t2 = createStore(
  combineReducers({
    ...reducers,
    routing: routerReducer
  })
)
const test2 = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}
console.log(typeof test);
const t3 = createStore(
  combineReducers({
    test2,
    routing: routerReducer
  })
)
