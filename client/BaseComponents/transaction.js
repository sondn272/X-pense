import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
    useFonts, 
    Montserrat_400Regular,
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_500Medium,
    Montserrat_800ExtraBold
} from '@expo-google-fonts/montserrat';
import { useNavigation } from '@react-navigation/native';

import { text_color, placeholder_color, negative_value_color, positive_value_color } from '../assets/consts'

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
});

const Transaction = props => {
    const { navigate } = useNavigation()

    const [fontsLoaded] = useFonts({
        Montserrat_Regular: Montserrat_400Regular,
        Montserrat_Medium: Montserrat_500Medium,
        Montserrat_SemiBold: Montserrat_600SemiBold,
        Montserrat_Bold: Montserrat_700Bold,
        Montserrat_ExtraBold: Montserrat_800ExtraBold,
    })

    const { transaction_id, category, amount, note, date } = props
    const { 
        category_name, 
        icon,
        icon_color,
        background_color,
    } = category

    if(!fontsLoaded) return <View/>

    return (
        <TouchableOpacity 
            style={{
                marginTop: 12,
                flexDirection: 'row',
                justifyContent: 'space-between'
            }}
            onPress={() => {
                navigate('Add new transaction', { props })
            }}
        >
            <View style={{flexDirection: 'row'}}>
                <View style={{
                    backgroundColor: background_color, 
                    width: 50, 
                    height: 50,
                    paddingLeft: icon === 'cash' ? 3 : 0,
                    paddingTop: icon === 'cash' ? 3 : 0,
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Ionicons name={icon} size={32} color={icon_color}/>
                </View>
                <View style={{justifyContent: 'center', marginLeft: 7}}>
                    <Text style={{
                        color: text_color,
                        fontFamily: 'Montserrat_Medium',
                        fontSize: 16,
                        lineHeight: 24
                    }}>{category_name}</Text>
                    <Text style={{
                        color: placeholder_color,
                        fontFamily: 'Montserrat_Regular',
                        fontSize: 14,
                        lineHeight: 21
                    }}>{note}</Text>
                </View>
            </View>
            <View style={{justifyContent: 'center'}}>
                <Text style={{
                    color: amount.value > 0 ? positive_value_color : negative_value_color,
                    fontFamily: 'Montserrat_Medium',
                    fontSize: 16,
                    lineHeight: 24,
                }}>{formatter.format(amount.value)}</Text>
                <View style={{height: 21}}/>
            </View>
        </TouchableOpacity>
    )
}

export default Transaction