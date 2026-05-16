import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import TimelineScreen from '../screens/TimelineScreen';
import LifeSetupScreen from '../screens/LifeSetupScreen';
import ResourcesScreen from '../screens/ResourcesScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'HomeTab':
              iconName = '🏠';
              break;
            case 'ChecklistTab':
              iconName = '📋';
              break;
            case 'TimelineTab':
              iconName = '📅';
              break;
            case 'LifeSetupTab':
              iconName = '🎯';
              break;
            case 'ResourcesTab':
              iconName = '🔍';
              break;
          }

          return (
            <View style={styles.iconContainer}>
              <Text style={[styles.icon, { opacity: focused ? 1 : 0.6 }]}>
                {iconName}
              </Text>
            </View>
          );
        },
        tabBarActiveTintColor: '#2E86AB',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#2E86AB',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarLabel: t('tabNavigator.home'),
        }}
      />
      <Tab.Screen
        name="ChecklistTab"
        component={ChecklistScreen}
        options={{
          headerShown: false,
          tabBarLabel: t('tabNavigator.checklist'),
        }}
        initialParams={{ pathway: 'work' }} // Default pathway
      />
      <Tab.Screen
        name="TimelineTab"
        component={TimelineScreen}
        options={{
          headerShown: false,
          tabBarLabel: t('tabNavigator.timeline'),
        }}
        initialParams={{ pathway: 'work' }} // Default pathway
      />
      <Tab.Screen
        name="LifeSetupTab"
        component={LifeSetupScreen}
        options={{
          headerShown: false,
          tabBarLabel: t('tabNavigator.lifeSetup'),
        }}
      />
      <Tab.Screen
        name="ResourcesTab"
        component={ResourcesScreen}
        options={{
          headerShown: false,
          tabBarLabel: t('tabNavigator.resources'),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
});

export default TabNavigator;