import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import loginScreen from './screens/loginScreen'; // Pantalla de Login
import principalScreen from './screens/principalScreen'; // Pantalla Principal
import userProfile from './screens/userProfile'; // Pantalla del Perfil
import agendaScreen from './screens/agendaScreen';
import patientScreen from './screens/patientScreen';
import createPatientScreen from './screens/createPatientScreen';
import createConsultationScreen from './screens/createConsultationScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="loginScreen">
        <Stack.Screen
          name="loginScreen"
          component={loginScreen}
          options={{ headerShown: false }} // Oculta el encabezado en Login
        />
         <Stack.Screen
          name="userProfile"
          component={userProfile}
          options={{ title: 'Perfil Profesional' }}
        />
        <Stack.Screen
          name="principalScreen"
          component={principalScreen}
          options={{ title: 'Principal' }}
        />

          <Stack.Screen
          name="patientScreen"
          component={patientScreen}
          options={{ title: 'Perfil Paciente' }}
        />

        <Stack.Screen
          name="createPatientScreen"
          component={createPatientScreen}
          options={{ title: 'Paciente' }}
        />

        <Stack.Screen
          name="createConsultationScreen"
          component={createConsultationScreen}
          options={{ title: 'Consulta' }}
        />



<Stack.Screen
  name="agendaScreen"
  component={agendaScreen}
  options={{ title: 'Agenda' }}
/>

       
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
