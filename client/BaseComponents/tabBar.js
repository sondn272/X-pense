import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const activeTintColor = '#AEEFAC'
const inactiveTintColor = '#43495D'

function TabBar({ state, descriptors, navigation }) {
  const focusedOptions = descriptors[state.routes[state.index].key].options;

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  return (
    <View style={{ 
      flexDirection: 'row',
      backgroundColor:'#383D4E',
      height: 70,
      justifyContent:"center",
      alignItems:"center",
    }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        let iconName;
        let iconSize;
        let shadow = {}

        if(isFocused && route.name !== 'Add new transaction') {
            shadow = {
                shadowColor: "#6CB86A",
                shadowOpacity: 0.5,
                shadowRadius: 5,
                elevation: 2,
                shadowOffset: {
                    width: 0,
                    height: 0,
                }
            }
        }

        if (route.name === 'Dashboard') {
          iconName = 'home'
          iconSize = 32
        } else if (route.name === 'Transactions') {
          iconName = 'card'
          iconSize = 36
        } else if (route.name === 'Monthly Report') {
          iconName = 'bar-chart'
          iconSize = 32
        }

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, { props: undefined });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityStates={isFocused ? ['selected'] : []}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{ 
                    flex: 1, 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'relative',
                    ...shadow
                }}
            >
                {route.name !== 'Add new transaction' &&
                    <Ionicons 
                        name={iconName} 
                        size={iconSize} 
                        color={isFocused ? activeTintColor : inactiveTintColor}
                    />
                }
                {route.name === 'Add new transaction' &&
                    <View style={{
                        width: 66,
                        height: 66,
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'absolute',
                        bottom: 2,
                        left: 5,
                        shadowColor: "#6CB86A",
                        shadowOpacity: 0.5,
                        shadowRadius: 5,
                        elevation: 1,
                        shadowOffset: {
                            width: 0,
                            height: 3,
                        }
                    }}>
                        <LinearGradient
                            colors={['#AEEFAC', '#8FD48C', '#70AE6E']}
                            style={{borderRadius: 33, padding: 8}}
                        >
                                <AntDesign 
                                    name={'plus'} 
                                    size={50} 
                                    color={'#304C31'}
                                />
                        </LinearGradient>
                    </View>
                }    
            </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default TabBar