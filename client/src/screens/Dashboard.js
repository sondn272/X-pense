import React from 'react';
import { View, Text } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const DashboardScreen = props => {
    console.log(AsyncStorage.getItem('token'))
    return (
        <View><Text></Text></View>
    )
}

export default DashboardScreen