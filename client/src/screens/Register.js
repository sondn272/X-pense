import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useMutation, gql } from '@apollo/client'
import AppLoading from 'expo-app-loading';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { 
    useFonts, 
    Montserrat_400Regular,
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_500Medium
} from '@expo-google-fonts/montserrat';

import InputField from '../../BaseComponents/input'

import { text_color, title_color, CTA_color, CTA_text_color } from '../../assets/consts'

const SIGN_UP_MUTATION = gql`
    mutation signUp(
        $email: String!
        $password: String!
        $name: String!
    ) {
        signUp(input: {
            email: $email
            password: $password
            name: $name
        }) {
        user {
            user_id
            name
            email
        }
        token
        }
    }
`

const SocialLogin = props => {
    const { icon, name, bgColor, fontFamily } = props
    return (
        <TouchableOpacity style={{
            width: '49%',
            backgroundColor: bgColor,
            height: 50,
            borderRadius: 12,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Ionicons name={icon} size={28} color={'#F2EDEB'} />
            <Text style={{
                marginLeft: 11,
                color: '#F2EDEB',
                fontFamily: fontFamily,
                fontSize: 20
            }}>{name}</Text>
        </TouchableOpacity>
    )
}

const RegisterScreen = props => {
    const { navigate } = props.navigation
    const [fontsLoaded] = useFonts({
        Montserrat_Regular: Montserrat_400Regular,
        Montserrat_Medium: Montserrat_500Medium,
        Montserrat_SemiBold: Montserrat_600SemiBold,
        Montserrat_Bold: Montserrat_700Bold
    })

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [signUp, { data, error, loading }] = useMutation(SIGN_UP_MUTATION)

    const onSubmit = () => {
        if(password === confirmPassword) {
            signUp({ variables: { name, email, password } })
        } else {
            Toast.show({
                type: 'error',
                text1: 'Password and confirmed password is not the same',
                visibilityTime: 4000,
            })
        }
    }

    useEffect(() => {
        if(data) {
            Toast.show({
                type: 'success',
                text1: 'Register successfully',
                visibilityTime: 4000,
            })
            navigate('LoginScreen')
        }
        if(error) {
            Toast.show({
                type: 'error',
                text1: error.toString(),
                visibilityTime: 4000,
            })
        }
    }, [loading])

    if(!fontsLoaded) {
        return <AppLoading />
    } else {
        return (
            <View style={styles.container}>
                <View style={{marginTop: 40}}>
                    <Text style={{
                        fontFamily: 'Montserrat_Bold',
                        color: title_color,
                        fontSize: 40,
                        lineHeight: 54
                    }}>Register</Text>
                </View>
                <View style={{width: '100%', justifyContent: 'center'}}>
                    <InputField 
                        icon={'person-outline'} 
                        placeholder={'Name'} 
                        contentType={'text'} 
                        value={name} 
                        onChange={(val) => setName(val)}
                    />
                    <InputField 
                        icon={'mail-outline'} 
                        placeholder={'Email'} 
                        contentType={'emailAddress'} 
                        value={email} 
                        onChange={(val) => setEmail(val)}
                    />
                    <InputField 
                        icon={'key-outline'} 
                        placeholder={'Password'} 
                        contentType={'password'} 
                        secureTextEntry={true}
                        value={password} 
                        onChange={(val) => setPassword(val)}
                    />
                    <InputField 
                        icon={'key-outline'} 
                        placeholder={'Confirm password'} 
                        contentType={'password'} 
                        secureTextEntry={true}
                        value={confirmPassword} 
                        onChange={(val) => setConfirmPassword(val)}
                    />
                </View>
                <View style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity
                        disabled={loading}
                        style={styles.cta}
                        onPress={onSubmit}
                    >
                        <Text style={{
                            fontSize: 22, 
                            fontFamily: 'Montserrat_SemiBold',
                            color: CTA_text_color
                        }}>Register</Text>
                    </TouchableOpacity>
                    <Text style={{
                        color: text_color,
                        fontFamily: 'Montserrat_Regular',
                        fontSize: 16,
                        marginBottom: 13
                    }}>or register with</Text>
                    <View style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 13
                    }}>
                        <SocialLogin icon={'logo-google'} name={'google'} bgColor={'#FD675A'} fontFamily={'Montserrat_Medium'}/>
                        <SocialLogin icon={'logo-facebook'} name={'facebook'} bgColor={'#568EFF'} fontFamily={'Montserrat_Medium'}/>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={{
                            color: text_color,
                            fontFamily: 'Montserrat_Regular',
                            fontSize: 16,
                            marginRight: 3
                        }}>Already had an account?</Text>
                        <TouchableOpacity onPress={() => navigate('LoginScreen')}>
                            <Text style={{
                                color: text_color,
                                fontFamily: 'Montserrat_SemiBold',
                                fontSize: 16,
                            }}>Login here</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 36,
        paddingHorizontal: 20
    },
    cta: {
        width: '100%',
        backgroundColor: CTA_color,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        marginBottom: 13
    }
})

export default RegisterScreen