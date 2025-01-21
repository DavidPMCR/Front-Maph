import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';

const forgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleForgotPassword = async () => {
    // Validación de los campos
    if (!email.trim()) {
      setError('El correo electrónico es obligatorio');
      return;
    }
    if (!reason.trim()) {
      setError('El motivo es obligatorio');
      return;
    }

    try {
      // Enviar los datos al servidor web
      const response = await axios.post('http://tuservidorweb.com/api/forgot-password', {
        email,
        reason,
      });

      if (response.data.success) {
        Alert.alert('Éxito', 'Tu solicitud ha sido enviada correctamente.');
        navigation.navigate('Inicio'); // Volver a la pantalla de inicio
      } else {
        setError('Hubo un problema al enviar tu solicitud.');
      }
    } catch (error) {
      setError('Error al conectarse con el servidor. Intenta más tarde.');
      console.error('Error en la solicitud:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#888"
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Motivo"
        value={reason}
        onChangeText={setReason}
        placeholderTextColor="#888"
        multiline
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
        <Text style={styles.buttonText}>Enviar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Inicio')}>
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default forgotPasswordScreen;
