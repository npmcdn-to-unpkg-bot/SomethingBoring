import * as cmpt from './cmpt/common.jsx';
export default {
  path: '/',
  component: cmpt.Layout,
  childRoutes: [
    { path: '/about', component: cmpt.About },
  ]
};
