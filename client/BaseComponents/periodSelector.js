import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { 
    useFonts, 
    Montserrat_700Bold,
    Montserrat_500Medium,
} from '@expo-google-fonts/montserrat';

import { CTA_text_color, positive_value_color } from '../assets/consts'

const PeriodSelector = props => {
    const [fontsLoaded] = useFonts({
        Montserrat_Medium: Montserrat_500Medium,
        Montserrat_Bold: Montserrat_700Bold,
    })

    const { periods, currentPeriod, setCurrentPeriod } = props

    if(!fontsLoaded) return <View/>

    return (
        <ScrollView 
            style={{ marginBottom: 40, overflow:'visible' }}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
        >
        {periods.map((period, i) => {
            const isActive = (period === currentPeriod)
            const shadow = isActive ? 
                        {
                            shadowColor: "#6CB86A",
                            shadowOpacity: 0.5,
                            shadowRadius: 3,
                            elevation: 2,
                            shadowOffset: {
                                width: 0,
                                height: 0,
                            },
                        } : {}
            return (
                <TouchableOpacity 
                    style={{
                        backgroundColor: isActive ? positive_value_color : '#44495B',
                        borderRadius: 50,
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                        marginRight: 10,
                        ...shadow
                    }}
                    key={`period_${i}`}
                    onPress={() => setCurrentPeriod(period)}
                >
                    <Text style={{
                        fontSize: 16,
                        color: isActive ? CTA_text_color : '#5B6278',
                        fontFamily: isActive ? 'Montserrat_Bold' : 'Montserrat_Medium'
                    }}>{period}</Text>
                </TouchableOpacity>
            )
        })}
            
        </ScrollView>
    )
}

export default PeriodSelector
