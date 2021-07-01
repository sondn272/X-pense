import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image } from 'react-native' 

import { useQuery, gql } from '@apollo/client';
import AppLoading from 'expo-app-loading';
import Toast from 'react-native-toast-message';
import PeriodSelector from '../../BaseComponents/periodSelector';
import { PieChart } from 'expo-chart-kit'
import _ from 'lodash';

import { 
    useFonts, 
    Montserrat_400Regular,
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_500Medium,
    Montserrat_800ExtraBold
} from '@expo-google-fonts/montserrat';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { text_color, title_color, placeholder_color, card_bg_color, negative_value_color, positive_value_color, bg_color } from '../../assets/consts'
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { useIsFocused } from '@react-navigation/native';

const GET_MONTHLY_REPORT_QUERY = gql`
    query ($month: String!, $year: String!){
        getMonthlyReport(filter: {
            year: $year
            month: $month
        }) {
            cash_flow {
                income {
                    value
                    currency
                }
                expense {
                    value
                    currency
                }
            }
            income {
                category {
                    category_id
                    category_name
                    icon
                    icon_color
                    background_color
                }
                amount {
                    value
                    currency
                }
            }
            expense {
                category {
                    category_id
                    category_name
                    icon
                    icon_color
                    background_color
                }
                amount {
                    value
                    currency
                }
            }
        }
    }
`

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
});

const windowWidth = Dimensions.get('window').width;

const ValueCard = ({title, value, valueColor}) => {
    return (
        <View style={{
            width: '48%', 
            backgroundColor: card_bg_color,
            paddingHorizontal: 10,
            paddingVertical: 15,
            borderRadius: 12
        }}>
            <Text style={{
                color: text_color,
                fontFamily: 'Montserrat_Medium',
                fontSize: 16,
                marginBottom: 10
            }}>{title}</Text>
            <Text style={{
                color: valueColor,
                alignSelf: 'flex-end',
                fontFamily: 'Montserrat_SemiBold',
                fontSize: 20
            }}>{formatter.format(value)}</Text>
        </View>
    )
}

const CategoryAmountCard = ({item}) => {
    const { value, icon, iconColor, color: backgroundColor, name: categoryName } = item
    return (
        <View style={{
            flexDirection: 'row', 
            backgroundColor, 
            width: '49%', 
            padding: 10, 
            borderRadius: 12,
            alignItems: 'center'
        }}>
            <Ionicons name={icon} size={30} color={iconColor}/>
            <View style={{marginLeft: 10}}>
                <Text style={{
                    color: bg_color,
                    marginBottom: 5,
                    fontFamily: 'Montserrat_Medium'
                }}>{categoryName}</Text>
                <Text style={{
                    color: bg_color,
                    fontFamily: 'Montserrat_SemiBold',
                    fontSize: 18
                }}>{formatter.format(value || 0)}</Text>
            </View>
        </View>
    )
}

const MonthlyReportScreen = props => {
    const isFocused = useIsFocused()

    const today = new Date()
    const month = today.getMonth()
    const year = today.getFullYear()

    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const [fontsLoaded] = useFonts({
        Montserrat_Regular: Montserrat_400Regular,
        Montserrat_Medium: Montserrat_500Medium,
        Montserrat_SemiBold: Montserrat_600SemiBold,
        Montserrat_Bold: Montserrat_700Bold,
        Montserrat_ExtraBold: Montserrat_800ExtraBold,
    })

    const [currentPeriod, setCurrentPeriod] = useState(`${monthName[month]} ${year}`)
    const [reportData, setReportData] = useState({})
    const [categoriesType, setCategoriesType] = useState('expense')
    const [chartData, setChartData] = useState([])

    const { data, error, loading, refetch } = useQuery(GET_MONTHLY_REPORT_QUERY, {
        variables: { month: currentPeriod.split(' ')[0], year: currentPeriod.split(' ')[1] }
    })

    useEffect(() => {
        isFocused && refetch({variables: { month: currentPeriod.split(' ')[0], year: currentPeriod.split(' ')[1] }})
    }, [isFocused]);

    useEffect(() => {
        if(!!data) {
            setReportData(data.getMonthlyReport)
        }
    }, [data])

    const { cash_flow, expense, income } = reportData
    
    useEffect(() => {
        if(!!reportData) {
            const datas = categoriesType === 'expense' ? expense : income
            const _chartData = _.values(_.mapValues(datas, value => {
                const { category, amount } = value
                return Object.assign({
                    name: category.category_name,
                    value: amount.value,
                    color: category.background_color,
                    legendFontColor: text_color,
                    legendFontSize: 14,
                    legendFontFamily: 'Montserrat_Medium',
                    icon: category.icon,
                    iconColor: category.icon_color
                })
            }))
            setChartData(_chartData)
        }
    }, [categoriesType, expense, income])

    if(!fontsLoaded) return <View/>
    
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
                }}>Monthly Report</Text>
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
            {!data && <View />}
            {(!!data && !!data.getMonthlyReport) &&
            <ScrollView showsVerticalScrollIndicator={false} style={{height: '78%'}}>
                <Text style={{
                    fontSize: 20,
                    fontFamily: 'Montserrat_SemiBold',
                    color: title_color
                }}>Cash flow</Text>
                <View style={{
                    width: '100%', 
                    marginTop: 10, 
                    flexDirection: 'row', 
                    justifyContent: 'space-between',
                    marginBottom: 40
                }}>
                    <ValueCard title={'Expense'} value={cash_flow?.expense?.value} valueColor={negative_value_color}/>
                    <ValueCard title={'Income'} value={cash_flow?.income?.value} valueColor={positive_value_color}/>
                </View>
                <Text style={{
                    fontSize: 20,
                    fontFamily: 'Montserrat_SemiBold',
                    color: title_color,
                }}>Categories</Text>
                <View style={{
                    flexDirection: 'row', 
                    width: '100%', 
                    borderBottomWidth: 0.5,
                    borderBottomColor: placeholder_color,
                    marginTop: 10
                }}>
                    <View style={{width: '50%'}}>
                        <TouchableOpacity 
                            style={{alignItems: 'center', justifyContent: 'center'}}
                            onPress={() => setCategoriesType('expense')}
                        >
                            <Text style={{
                                color: categoriesType === 'expense' ? positive_value_color : placeholder_color,
                                fontFamily: categoriesType === 'expense' ? 'Montserrat_SemiBold' : 'Montserrat_Medium',
                                fontSize: 18,
                                lineHeight: 36,
                            }}>Expense</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{width: '50%'}}>
                        <TouchableOpacity 
                            style={{alignItems: 'center', justifyContent: 'center'}}
                            onPress={() => setCategoriesType('income')}
                        >
                            <Text style={{
                                color: categoriesType === 'income' ? positive_value_color : placeholder_color,
                                fontFamily: categoriesType === 'income' ? 'Montserrat_SemiBold' : 'Montserrat_Medium',
                                fontSize: 18,
                                lineHeight: 36
                            }}>Income</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {(chartData && !!data) &&
                <>
                    <PieChart
                        data={chartData}
                        width={windowWidth-40}
                        height={200}
                        chartConfig={{
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            style: {
                                borderRadius: 16
                            },
                            propsForLabels: {
                                fontFamily: 'Montserrat_Medium',
                            },
                        }}
                        accessor="value"
                        backgroundColor="transparent"
                    />
                    <FlatList 
                        columnWrapperStyle={{justifyContent: 'space-between', marginTop: 5}}
                        data={chartData}
                        renderItem={CategoryAmountCard}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                    />
                </>
                }
            </ScrollView>
            }
            {!!data && !data.getMonthlyReport &&
                <View style={{alignItems: 'center'}}>
                    <Text style={{
                        fontFamily: 'Montserrat_Regular',
                        color: text_color,
                        fontSize: 16
                    }}>No data to calculate report!</Text>
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

export default MonthlyReportScreen