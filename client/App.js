import 'react-native-gesture-handler';
import * as React from "react";
import { View, Text } from 'react-native'

import { ApolloProvider } from '@apollo/client'
import { client } from './apollo'

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { bg_color, card_bg_color } from './assets/consts'
import { 
  useFonts, 
  Montserrat_400Regular,
  Montserrat_700Bold,
  Montserrat_600SemiBold,
  Montserrat_500Medium
} from '@expo-google-fonts/montserrat';
import { AntDesign } from '@expo/vector-icons';

import Toast, { BaseToast } from 'react-native-toast-message';

import SplashScreen from './src/screens/SplashScreen'
import LoginScreen from './src/screens/Login'
import RegisterScreen from './src/screens/Register'

import TabBar from './BaseComponents/tabBar'
import DashboardScreen from './src/screens/Dashboard'
import TransactionsScreen from './src/screens/Transactions'
import MonthlyReportScreen from './src/screens/MonthlyReport'
import AddNewTransactionScreen from './src/screens/AddNewTransaction'

const Tab = createBottomTabNavigator();

const MainScreens = () => {
  return (
    <Tab.Navigator
      sceneContainerStyle={{
        backgroundColor: bg_color,
      }}
      tabBar={props => <TabBar {...props} />}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Monthly Report" component={MonthlyReportScreen} />
      <Tab.Screen name="Add new transaction" component={AddNewTransactionScreen} options={{tabBarVisible: false }}/>
    </Tab.Navigator>
  )
}

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
      Montserrat_Regular: Montserrat_400Regular,
      Montserrat_Medium: Montserrat_500Medium,
      Montserrat_SemiBold: Montserrat_600SemiBold,
      Montserrat_Bold: Montserrat_700Bold
  })

  return (
    <>
      <ApolloProvider client={client}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: bg_color },
              gestureEnabled: false
            }}
          >
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            <Stack.Screen name="MainScreens" component={MainScreens} /> 
          </Stack.Navigator>
        </NavigationContainer>
      </ApolloProvider>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </>
  );
}
