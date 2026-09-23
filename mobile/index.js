import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('App', () => App);

if (typeof document !== 'undefined') {
  const rootTag = document.getElementById('root') || document.getElementById('main');
  AppRegistry.runApplication('App', { rootTag });
}
