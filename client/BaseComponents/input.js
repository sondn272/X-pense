import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { card_text_color, card_bg_color, placeholder_color } from '../assets/consts'

const InputField = props => {
    const {
        icon,
        placeholder,
        contentType,
        secureTextEntry,
        value,
        onChange,
        required
    } = props;

    return (
        <View style={styles.inputContainer}>
            <Ionicons name={icon} size={24} color={card_text_color} />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={placeholder_color}
                textContentType={contentType}
                secureTextEntry={secureTextEntry}
                value={value}
                onChangeText={onChange}
                required={required}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: card_bg_color,
        width: '100%',
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        paddingLeft: 10,
        marginBottom: 15
    },
    input: {
        width: '100%',
        marginLeft: 8,
        color: card_text_color,
        fontSize: 16,
        fontFamily: 'Montserrat_Regular'
    }
})

export default InputField