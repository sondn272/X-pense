import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native' 
import { useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInputMask } from 'react-native-masked-text'

import { 
    useFonts, 
    Montserrat_400Regular,
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_500Medium,
    Montserrat_800ExtraBold
} from '@expo-google-fonts/montserrat';

import { 
    card_bg_color, 
    card_text_color, 
    placeholder_color, 
    text_color,
    positive_value_color,
    negative_value_color,
    title_color,
    CTA_text_color,
    CTA_color
} from '../../assets/consts'
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';

import { useQuery, useMutation, gql } from '@apollo/client'
import Toast from 'react-native-toast-message';

const GET_CATEGORIES_QUERY = gql`
    query {
        getCategories {
            type
            categories {
                category_id
                category_name
                icon
                icon_color
                background_color
                type
            }
        }
    }
`

const ADD_NEW_TRANSACTION_MUTATION = gql`
    mutation (
        $category_id: ID!
        $day: String!
        $month: String!
        $year: String!
        $currency: String!
        $amount: Float!
        $note: String
    ){
        addNewTransaction(input: {
            category_id: $category_id
            day: $day
            month: $month
            year: $year
            value: $amount
            currency: $currency
            note: $note
        }) {
            transaction_id
            category {
                category_id
                category_name
                icon
                icon_color
                background_color
                type
            }
            user_id
            date {
                day
                month
                year
            }
            amount {
                value
                currency
            }
            note
        }
    }
`

const UPDATE_TRANSACTION_MUTATION = gql`
    mutation (
        $transaction_id: ID!
        $category_id: ID
        $day: String
        $month: String
        $year: String
        $value: Float
        $currency: String
        $note: String
    ){
        updateTransaction(input: {
            transaction_id: $transaction_id
            category_id: $category_id
            day: $day
            month: $month
            year: $year
            value: $value
            currency: $currency
            note: $note
        }) {
            transaction_id
            date {
                month
            }
            category {
                category_id
                category_name
                icon
            }
            amount {
                currency
                value
            }
            note
        }
    }
`

const DELETE_TRANSACTION_MUTATION = gql`
    mutation ($transaction_id: String!) {
        deleteTransaction(transaction_id: $transaction_id)
    }
`

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
});

const AddNewTransactionScreen = ({ route, navigation }) => {
    const { params } = route

    let transaction_id, category, amount, currentDate
    if(params) {
        transaction_id = params.props?.transaction_id
        category = params.props?.category
        amount = params.props?.amount
        currentDate = params.props?.date
    }

    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const [fontsLoaded] = useFonts({
        Montserrat_Regular: Montserrat_400Regular,
        Montserrat_Medium: Montserrat_500Medium,
        Montserrat_SemiBold: Montserrat_600SemiBold,
        Montserrat_Bold: Montserrat_700Bold,
        Montserrat_ExtraBold: Montserrat_800ExtraBold,
    })

    const [openCategories, setOpenCategories] = useState(true)
    const [openingCategoriesType, setOpeningCategoriesType] = useState('expense')
    const [categoriesData, setCategoriesData] = useState([])
    const [categoryId, setCategoryId] = useState(null)
    const [categoryName, setCategoryName] = useState(null)
    const [categoryIcon, setCategoryIcon] = useState(null)
    const [categoryIconColor, setCategoryIconColor] = useState(null)
    const [categoryBackgroundColor, setCategoryBackgroundColor] = useState(null)
    const [categoryType, setCategoryType] = useState(null)
    const [amountValue, setAmountValue] = useState(null)
    const [note, setNote] = useState(null)
    const [date, setDate] = useState(null)
    
    useEffect(() => {
        setOpeningCategoriesType(category?.type || 'expense')
        setCategoryId(category?.category_id || null)
        setCategoryName(category?.category_name || 'Category')
        setCategoryIcon(category?.icon || '')
        setCategoryIconColor(category?.icon_color || '')
        setCategoryBackgroundColor(category?.background_color || '')
        setCategoryType(category?.type || 'expense')
        setDate(new Date(
            currentDate?.year || new Date().getFullYear(), 
            currentDate? monthName.indexOf(currentDate.month) : new Date().getMonth(), 
            currentDate?.day || new Date().getDate()
        ))
        setAmountValue(amount?.value || 0)
        setNote(params?.props?.note || '')
    }, [params, category, amount, currentDate])

    const {
        data: _categoriesData,
        error: _categoriesError,
        loading: _categoriesLoading
    } = useQuery(GET_CATEGORIES_QUERY)

    const [
        addNewTransaction, 
        {
            data: addTransactionData,
            error: addTransactionError,
            loading: addTransactionLoading
        }
    ] = useMutation(ADD_NEW_TRANSACTION_MUTATION)

    const [
        updateTransaction,
        {
            data: updateTransactionData,
            error: updateTransactionError,
            loading: updateTransactionLoading
        }
    ] = useMutation(UPDATE_TRANSACTION_MUTATION)

    const [
        deleteTransaction, 
        {
            data: deleteTransactionData,
            error: deleteTransactionError,
            loading: deleteTransactionLoading
        }
    ] = useMutation(DELETE_TRANSACTION_MUTATION)

    useEffect(() => {
        if(_categoriesData) {
            if(openingCategoriesType === 'expense') setCategoriesData(_categoriesData.getCategories[0].categories)
            if(openingCategoriesType === 'income') setCategoriesData(_categoriesData.getCategories[1].categories)
        }
    }, [openingCategoriesType, categoriesData, _categoriesData])

    useEffect(() => {
        if(categoryType === 'expense' && parseFloat(amountValue) > 0) setAmountValue(amountValue*-1)
        if(categoryType === 'income' && parseFloat(amountValue) < 0) setAmountValue(amountValue*-1)
    }, [amountValue, categoryType])

    useEffect(() => {
        if(!!addTransactionData) {
            Toast.show({
                type: 'success',
                text1: 'Add new transaction successfully',
                visibilityTime: 4000,
            })
        }
        if(!!addTransactionError) {
            Toast.show({
                type: 'error',
                text1: addTransactionError?.toString().split(': ').pop(),
                visibilityTime: 4000,
            })
        }
    }, [addTransactionError, addTransactionData])

    useEffect(() => {
        if(!!updateTransactionData) {
            Toast.show({
                type: 'success',
                text1: 'Update transaction successfully',
                visibilityTime: 4000,
            })
        }
        if(!!updateTransactionError) {
            Toast.show({
                type: 'error',
                text1: updateTransactionError?.toString().split(': ').pop(),
                visibilityTime: 4000,
            })
        }
    }, [updateTransactionError, updateTransactionData])

    useEffect(() => {
        if(!!deleteTransactionData) {
            Toast.show({
                type: 'success',
                text1: 'Delete transaction successfully',
                visibilityTime: 4000,
            })
        }
        if(!!deleteTransactionError) {
            Toast.show({
                type: 'error',
                text1: deleteTransactionError?.toString().split(': ').pop(),
                visibilityTime: 4000,
            })
        }
    }, [deleteTransactionError, deleteTransactionData])

    const renderCateogry = ({item}) => {
        const {
            category_id,
            category_name,
            icon,
            icon_color,
            background_color,
            type
        } = item
        return (
            <View style={{flex: 1/3, width: '100%', paddingVertical: 15}}>
                <TouchableOpacity 
                    style={{justifyContent: 'center', alignItems: 'center'}}
                    onPress={() => {
                        setCategoryId(category_id)
                        setCategoryName(category_name)
                        setCategoryIcon(icon)
                        setCategoryIconColor(icon_color)
                        setCategoryBackgroundColor(background_color)
                        setCategoryType(type)
                    }}
                >
                    <View style={{
                        backgroundColor: item.background_color,
                        width: 50,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingLeft: item.icon === 'cash' ? 3 : 0,
                        paddingTop: item.icon === 'cash' ? 3 : 0,
                        borderRadius: 12,
                    }}>
                        <Ionicons name={icon} size={32} color={icon_color}/>
                    </View>
                        <Text style={{
                            fontFamily: 'Montserrat_Medium',
                            color: category_id === categoryId ? positive_value_color : text_color,
                            fontSize: 16,
                            marginTop: 5
                        }}>{item.category_name}</Text>
                </TouchableOpacity>
            </View>
        )
    }
    
    const Buttons = (
        <View style={{
            position: 'absolute', 
            left: 0, 
            right: 0, 
            bottom: 0,
            marginBottom: 20,
            paddingHorizontal: 20,
            width: '100%',
            flexDirection:'row',
            justifyContent: 'space-between'
        }}>
        {!transaction_id &&
            <View style={{width: '66%'}}>
                <TouchableOpacity
                    style={{
                        width: '100%',
                        paddingVertical: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: CTA_color,
                        borderRadius: 30,
                    }}
                    disabled={addTransactionLoading}
                    onPress={() => {
                        addNewTransaction({ variables: {
                            category_id: categoryId,
                            day: date?.getDate().toString(),
                            month: monthName[date?.getMonth()],
                            year: date?.getFullYear().toString(),
                            currency: 'vnd',
                            amount: amountValue,
                            note
                        }})
                        navigation.goBack()
                    }}
                >
                    <Text style={{
                        color: CTA_text_color,
                        fontFamily: 'Montserrat_Medium',
                        fontSize: 20,
                        lineHeight: 30
                    }}>Add new transactions</Text>
                </TouchableOpacity>
            </View>
        }
        {!!transaction_id &&
        <>
            <View style={{width: '32%'}}>
                <TouchableOpacity
                    style={{
                        width: '100%',
                        paddingVertical: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: CTA_color,
                        borderRadius: 30,
                    }}
                    onPress={() => {
                        updateTransaction({ variables: {
                            transaction_id,
                            category_id: categoryId,
                            day: date?.getDate().toString(),
                            month: monthName[date?.getMonth()],
                            year: date?.getFullYear().toString(),
                            currency: 'vnd',
                            amount: amountValue,
                            note
                        }})
                        navigation.goBack()
                    }}
                >
                    <Text style={{
                        color: CTA_text_color,
                        fontFamily: 'Montserrat_Medium',
                        fontSize: 20,
                        lineHeight: 30
                    }}>Save</Text>
                </TouchableOpacity>
            </View>
            <View style={{width: '32%'}}>
                <TouchableOpacity
                    style={{
                        width: '100%',
                        paddingVertical: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#CB6E78',
                        borderRadius: 30,
                    }}
                    onPress={() => {
                        deleteTransaction({variables: { transaction_id } })
                        navigation.goBack()
                    }}
                >
                    <Text style={{
                        color: '#461116',
                        fontFamily: 'Montserrat_Medium',
                        fontSize: 20,
                        lineHeight: 30
                    }}>Delete</Text>
                </TouchableOpacity>
            </View>
        </>
        }
            <View style={{width: '32%'}}>
                <TouchableOpacity
                    style={{
                        width: '100%',
                        paddingVertical: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#515562',
                        borderRadius: 30,
                    }}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={{
                        color: '#777A86',
                        fontFamily: 'Montserrat_Medium',
                        fontSize: 20,
                        lineHeight: 30
                    }}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    )

    return (
        <View style={{flex: 1}}>
            <View style={{
                flexDirection: 'row', 
                paddingTop: 35,
                paddingBottom: 15,
                paddingHorizontal: 20,
                backgroundColor: card_bg_color,
                justifyContent: 'space-between'
            }}>
                <View style={{flexDirection: 'row'}}>
                    <View style={{
                        backgroundColor: categoryBackgroundColor || '#FFFFFF00', 
                        width: 60, 
                        height: 60,
                        paddingLeft: categoryIcon === 'cash' ? 3 : 0,
                        paddingTop: categoryIcon === 'cash' ? 1 : 0,
                        borderRadius: 12,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: !category && !categoryId ? 1 : 0,
                        borderStyle: !category && !categoryId ? 'dashed' : 'none',
                        borderColor: !category && !categoryId ? text_color : 'none'
                    }}>
                        <Ionicons name={categoryIcon} size={38} color={categoryIconColor}/>
                    </View>
                    <View style={{justifyContent: 'center', marginLeft: 7}}>
                        <Text style={{
                            color: text_color,
                            fontFamily: 'Montserrat_Medium',
                            fontSize: 18,
                            lineHeight: 27
                        }}>{categoryName}</Text>
                        <Text style={{
                            color: placeholder_color,
                            fontFamily: 'Montserrat_Regular',
                            fontSize: 16,
                            lineHeight: 24
                        }}>{note || 'Note'}</Text>
                    </View>
                </View>
                <View style={{justifyContent: 'center'}}>
                    <Text style={{
                        color: categoryType === 'income' ? positive_value_color : negative_value_color,
                        fontFamily: 'Montserrat_Medium',
                        fontSize: 18,
                        lineHeight: 27,
                    }}>{isNaN(amountValue) ? amountValue : formatter.format(amountValue)}</Text>
                    <View style={{height: 24}}/>
                </View>
            </View>
            <View style={{paddingHorizontal: 20}}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={{
                        marginTop: 20, 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: openCategories ? 10 : 30
                    }}
                    onPress={() => setOpenCategories(!openCategories)}
                >
                    <Text style={{
                        fontFamily: 'Montserrat_Medium',
                        fontSize: 20,
                        lineHeight: 30,
                        color: title_color
                    }}>Choose a category</Text>
                    <Ionicons name={openCategories ? 'chevron-down' : 'chevron-up'} size={26} color={title_color}/>
                </TouchableOpacity> 
                <View style={{display: openCategories ? '' : 'none', marginBottom: 20}}>
                    <View style={{
                        flexDirection: 'row', 
                        width: '100%', 
                        borderBottomWidth: 1,
                        borderBottomColor: placeholder_color,
                    }}>
                        <View style={{width: '50%'}}>
                            <TouchableOpacity 
                                style={{alignItems: 'center', justifyContent: 'center'}}
                                onPress={() => setOpeningCategoriesType('expense')}
                            >
                                <Text style={{
                                    color: openingCategoriesType === 'expense' ? positive_value_color : placeholder_color,
                                    fontFamily: openingCategoriesType === 'expense' ? 'Montserrat_SemiBold' : 'Montserrat_Medium',
                                    fontSize: 18,
                                    lineHeight: 36,
                                }}>Expense</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{width: '50%'}}>
                            <TouchableOpacity 
                                style={{alignItems: 'center', justifyContent: 'center'}}
                                onPress={() => setOpeningCategoriesType('income')}
                            >
                                <Text style={{
                                    color: openingCategoriesType === 'income' ? positive_value_color : placeholder_color,
                                    fontFamily: openingCategoriesType === 'income' ? 'Montserrat_SemiBold' : 'Montserrat_Medium',
                                    fontSize: 18,
                                    lineHeight: 36
                                }}>Income</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <FlatList 
                        data={categoriesData}
                        renderItem={renderCateogry}
                        keyExtractor={(item) => item.id}
                        numColumns={3}
                    />
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30}}>
                    <Text style={{
                        fontFamily: 'Montserrat_Medium',
                        fontSize: 20,
                        lineHeight: 30,
                        color: title_color
                    }}>Choose date</Text>
                    {!!date && 
                        <DateTimePicker 
                            value={date}
                            style={{width: 105}}
                            onChange={(e, date) => setDate(date)}
                        />
                    }
                    
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30}}>
                    <Text style={{
                            fontFamily: 'Montserrat_Medium',
                            fontSize: 20,
                            lineHeight: 30,
                            color: title_color
                    }}>Enter an amount</Text>
                    <TextInputMask
                        type={'money'}
                        options={{
                          precision: 0,
                          separator: ',',
                          delimiter: ',',
                          unit: 'đ',
                          suffixUnit: ''
                        }}
                        value={amountValue}
                        onChangeText={text => {
                            let number = Number(text.replace(/[^0-9.-]+/g,""));
                            setAmountValue(number)
                        }}
                        style={{
                            fontFamily: 'Montserrat_Medium',
                            color: categoryType === 'income' ? positive_value_color : negative_value_color ,
                            fontSize: 18
                        }}
                    />
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30}}>
                    <Text style={{
                        fontFamily: 'Montserrat_Medium',
                        fontSize: 20,
                        lineHeight: 30,
                        color: title_color
                    }}>Write a note</Text>
                    <TextInput
                        value={note}
                        onChangeText={val => setNote(val)}
                        style={{
                            fontFamily: 'Montserrat_Medium',
                            color: text_color,
                            fontSize: 18
                        }}
                        placeholder='Write a note'
                        placeholderTextColor={placeholder_color}
                    />
                </View>
            </View>
            {Buttons}
        </View>
    )
}

export default AddNewTransactionScreen