import React from 'react'
import { View, Text } from 'react-native'
import AppLoading from 'expo-app-loading';
import { 
    text_color, 
    title_color, 
    CTA_color, 
    CTA_text_color, 
    card_bg_color, 
    placeholder_color 
} from '../assets/consts'
import { 
    useFonts, 
    Montserrat_400Regular,
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_500Medium,
    Montserrat_800ExtraBold
} from '@expo-google-fonts/montserrat';
import { TouchableOpacity } from 'react-native-gesture-handler';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
});

const DailyTransactionsCard = props => {
    const [fontsLoaded] = useFonts({
        Montserrat_Regular: Montserrat_400Regular,
        Montserrat_Medium: Montserrat_500Medium,
        Montserrat_SemiBold: Montserrat_600SemiBold,
        Montserrat_Bold: Montserrat_700Bold,
        Montserrat_ExtraBold: Montserrat_800ExtraBold,
    })

    if(!fontsLoaded) {
        return <AppLoading />
    }
    const { date, children, amount } = props

    return (
        <View style={{
            backgroundColor: card_bg_color,
            borderRadius: 12,
            padding: 15,
            marginBottom: 25
        }}>
            {(date && amount) &&
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingBottom: 12,
                    borderBottomColor: '#4C536B',
                    borderBottomWidth: 1.5
                }}>
                    <Text style={{
                        color: title_color, 
                        fontSize: 18, 
                        fontFamily: 'Montserrat_SemiBold'
                    }}>{date}</Text>
                    <Text style={{
                        color: title_color, 
                        fontSize: 18, 
                        fontFamily: 'Montserrat_SemiBold'
                    }}>{formatter.format(amount.value)}</Text>
                </View>
            }
            {props.children}
        </View>
    )
}

export default DailyTransactionsCard