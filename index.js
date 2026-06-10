/**
 * @format
 */

// react-native-gesture-handler MUST be the very first import
import 'react-native-gesture-handler';

import { enableScreens } from 'react-native-screens';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Enable native screen containers before any navigation code runs.
// Without this, react-navigation renders nothing on screen.
enableScreens();

AppRegistry.registerComponent(appName, () => App);
