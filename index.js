/**
 * @format
 */

import '@react-native-firebase/app';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { installJavaScriptCrashHandler } from './src/monitoring/appMonitoring';

installJavaScriptCrashHandler();

AppRegistry.registerComponent(appName, () => App);
