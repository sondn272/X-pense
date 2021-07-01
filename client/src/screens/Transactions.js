import React, { useState, useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useQuery, gql } from '@apollo/client';
import AppLoading from 'expo-app-loading';
import Toast from 'react-native-toast-message';
import PeriodSelector from '../../BaseComponents/periodSelector';
import DailyTransactionsCard from '../../BaseComponents/dailyTransactionsCard'
import Transaction from '../../BaseComponents/transaction'
import { 
    useFonts, 
    Montserrat_400Regular,
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_500Medium,
    Montserrat_800ExtraBold
} from '@expo-google-fonts/montserrat';
import { AntDesign } from '@expo/vector-icons';

import { text_color, title_color, CTA_color, CTA_text_color } from '../../assets/consts'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { useIsFocused } from '@react-navigation/native';

const GET_TRANSACTIONS_QUERY = gql`
    query getTransactions(
        $month: String!
        $year: String!
    ){
        getTransactions(filter: {
            year: $year
            month: $month
        }) {
            date {
                day
                month
                year
            }
            amount {
                currency
                value
            }
            transactions {
                transaction_id
                category {
                    category_id
                    category_name
                  	icon
                  	icon_color
                    background_color
                    type
                }
                amount {
                    value
                    currency
                }
                note
            }
        }
    }
`

const TransactionsScreen = ({navigation}) => {
    const isFocused = useIsFocused()

    const today = new Date()
    const month = today.getMonth()
    const year = today.getFullYear()

    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const [dailyTransactions, setDailyTransactions] = useState([])
    const [currentPeriod, setCurrentPeriod] = useState(`${monthName[month]} ${year}`)

    const [fontsLoaded] = useFonts({
        Montserrat_Regular: Montserrat_400Regular,
        Montserrat_Medium: Montserrat_500Medium,
        Montserrat_SemiBold: Montserrat_600SemiBold,
        Montserrat_Bold: Montserrat_700Bold,
        Montserrat_ExtraBold: Montserrat_800ExtraBold,
    })

    const { data, error, loading, refetch } = useQuery(GET_TRANSACTIONS_QUERY, {
        variables: { month: currentPeriod.split(' ')[0], year: currentPeriod.split(' ')[1] }
    })

    useEffect(() => {
        isFocused && refetch({variables: { month: currentPeriod.split(' ')[0], year: currentPeriod.split(' ')[1] }})
    }, [isFocused]);

    useEffect(() => {
        if(data) {
            setDailyTransactions(data.getTransactions)
        }
        if(error) {
            Toast.show({
                type: 'error',
                text1: error.toString().split(': ').pop(),
                visibilityTime: 4000,
            })
        }
    }, [data, error])

    if(!fontsLoaded) {
        return <AppLoading />
    }

    return (
        <View style={{
            paddingTop: 40,
            paddingHorizontal: 20,
        }}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 30
            }}>
                <Text style={{
                    color: title_color,
                    fontFamily: 'Montserrat_ExtraBold',
                    fontSize: 30,
                    lineHeight: 45
                }}>Transactions</Text>
                <TouchableOpacity>
                    <AntDesign name="menufold" size={24} color={title_color} />
                </TouchableOpacity>
            </View>
            <PeriodSelector 
                periods={[
                    (month-2 >= 0) ? `${monthName[month - 2]} ${year}` : `${monthName[(month-2)%12 + 12]} ${year-1}`,
                    (month-1 >= 0) ? `${monthName[month - 1]} ${year}` : `${monthName[(month-1)%12+ 12]} ${year-1}`,
                    `${monthName[month]} ${year}`,
                    (month+1 <= 11) ? `${monthName[month+1]} ${year}` : `${monthName[(month+1)%12]} ${year+1}`,
                    (month+2 <= 11) ? `${monthName[month+2]} ${year}` : `${monthName[(month+2)%12]} ${year+1}`,
                ]}
                currentPeriod={currentPeriod}
                setCurrentPeriod={setCurrentPeriod}
            />
            {!!data && data.getTransactions.length != 0 &&
                <ScrollView showsVerticalScrollIndicator={false} style={{height: '78%'}}>
                {dailyTransactions.map((trans, index) => {
                    const { date, amount, transactions } = trans
                    const { month, day } = date
                    return (
                        <DailyTransactionsCard date={`${month} ${day}`} amount={amount} key={`transaction_${index}`}>
                            {transactions.map(tran => {
                                const { category, amount, note, transaction_id } = tran
                                return (
                                    <Transaction 
                                        transaction_id={transaction_id}
                                        date={date}
                                        category={category}
                                        amount={amount}
                                        note={note}
                                    />
                                )
                            })}
                        </DailyTransactionsCard>
                    )
                })}
                </ScrollView>
            }
            {!!data && !data.getTransactions.length &&
                <View style={{alignItems: 'center'}}>
                    <Text style={{
                        fontFamily: 'Montserrat_Regular',
                        color: text_color,
                        fontSize: 16
                    }}>No transactions!</Text>
                </View>
            }
            {loading &&
                <View style={{flex: 'auto', justifyContent: 'center', alignItems: 'center'}}>
                    <Image 
                        style={{
                            width: 50,
                            height: undefined,
                            aspectRatio: 1,
                            opacity: 0.5
                        }}
                        source={require('../../assets/loading.gif')} 
                    />
                </View>
            }
        </View>
    )
}

export default TransactionsScreen