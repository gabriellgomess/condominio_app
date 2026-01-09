import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import MainTabScreen from '../screens/MainTabScreen';
import IncidentsScreen from '../screens/IncidentsScreen';
import NewIncidentScreen from '../screens/NewIncidentScreen';
import IncidentDetailScreen from '../screens/IncidentDetailScreen';
import EventsScreen from '../screens/EventsScreen';
import VisitorsScreen from '../screens/VisitorsScreen';
import VisitorValidationScreen from '../screens/VisitorValidationScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabScreen} />
            <Stack.Screen name="Incidents" component={IncidentsScreen} />
            <Stack.Screen name="NewIncident" component={NewIncidentScreen} />
            <Stack.Screen name="IncidentDetail" component={IncidentDetailScreen} />
            <Stack.Screen name="Events" component={EventsScreen} />
            <Stack.Screen name="Visitors" component={VisitorsScreen} />
            <Stack.Screen name="VisitorValidation" component={VisitorValidationScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
