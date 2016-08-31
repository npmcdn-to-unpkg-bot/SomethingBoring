import * as cmpt from './cmpt/cats.jsx';
export default {
  path: '/',
  component: cmpt.Index,
  childRoutes: [
    { path: '/about', component: cmpt.About },
  ]
};
