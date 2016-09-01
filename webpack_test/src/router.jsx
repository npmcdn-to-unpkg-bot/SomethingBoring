import * as cmpt from './cmpt/common.jsx';
import { Route, IndexRoute} from 'react-router';
export default (
  <Route path="/" component={cmpt.Root}>
    <IndexRoute component={cmpt.Home}/>
    <Route path="env" component={cmpt.Bottom}>
      <Route path="about" component={cmpt.About}/>
    </Route>
  </Route>
);
