import React, { useEffect } from 'react';
import { View, Image, Text } from 'react-native';
import AppLoading from 'expo-app-loading';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { title_color } from '../../assets/consts'

import { 
    useFonts, 
    Montserrat_600SemiBold,
} from '@expo-google-fonts/montserrat';

const SplashScreen = props => {
    const { navigate } = props.navigation

    const [fontLoaded] = useFonts({ Montserrat_SemiBold: Montserrat_600SemiBold })

    const isAuthenticated = async () => {
        const token = await AsyncStorage.getItem('token');
        return !!token
    }
    
    useEffect(() => {
        const checkUser = async () => {
            if(await isAuthenticated()) {
                navigate('MainScreens')
            } else {
                navigate('LoginScreen')
            }
        }
        setTimeout(() => checkUser(), 4000);
    }, [])

    if(!fontLoaded) {
        return <AppLoading />
    }

    return (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Image 
                style={{
                        width: 240, 
                    height: undefined, 
                    aspectRatio: 752/858
                }} 
                source={require('../../assets/splash-image.png')}
            />
            <Text style={{
                marginTop: 40,
                fontSize: 40,
                fontFamily: 'Montserrat_SemiBold',
                color: title_color
            }}>X-pense</Text>
        </View>
    )
}

export default SplashScreen