import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity, Switch, ScrollView, ImageBackground } from 'react-native';
import axios from 'axios';
import api from '../controller/api';

const CreateUserRequestScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    id_cedula: '',
    nombre: '',
    apellidos: '',
    telefono: '',
    correo: ''
  });

  const [hasCompany, setHasCompany] = useState(false);
  const [companyData, setCompanyData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    correo: ''
  });

  const [error, setError] = useState('');
//validaciones 
  const handleInputChange = (field, value) => {
    if (field === 'nombre' || field === 'apellidos') {
      value = value.replace(/[0-9]/g, ''); // Bloquear números
    }
    if (field === 'telefono' || field === 'id_cedula') {
      value = value.replace(/[^0-9]/g, ''); // Permitir solo números
    }
    setUserData({ ...userData, [field]: value });
  };

  const handleCompanyInputChange = (field, value) => {
    if (field === 'nombre') {
      value = value.replace(/[0-9]/g, ''); // Bloquear números
    }
    if (field === 'telefono' || field === 'cedula') {
      value = value.replace(/[^0-9]/g, ''); // Permitir solo números
    }
    setCompanyData({ ...companyData, [field]: value });
  };

  const handleCreateUserRequest = async () => {
    if (!userData.id_cedula.trim() || !userData.nombre.trim() || !userData.apellidos.trim() || !userData.telefono.trim() || !userData.correo.trim()) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (hasCompany && (!companyData.nombre.trim() || !companyData.cedula.trim() || !companyData.telefono.trim() || !companyData.correo.trim())) {
      setError('Por favor completa los datos de la empresa.');
      return;
    }
      // obtener la data que se va a enviar
    const emailData = {
      email: 'SOPORTEMAPH@GMAIL.COM',
      reason: `🆕 Solicitud de Creación de Usuario\n
      - 🆔 Cédula: ${userData.id_cedula}
      - 👤 Nombre: ${userData.nombre} ${userData.apellidos}
      - 📞 Teléfono: ${userData.telefono}
      - 📧 Correo: ${userData.correo}

      ${hasCompany ? `
      🏢 Información de la Empresa:
      - 🏢 Nombre: ${companyData.nombre}
      - 🆔 Cédula Empresa: ${companyData.cedula}
      - 📞 Teléfono: ${companyData.telefono}
      - 📧 Correo: ${companyData.correo}
      ` : ''}
      `
    };

    try {
      await axios.post(`${api}/sendEmail/createUser`, emailData);  //envia los detalles al backend para que envie correo
      Alert.alert('Éxito', 'Tu solicitud ha sido enviada correctamente.');
      navigation.navigate('loginScreen');
    } catch (error) {
      setError('Error al enviar la solicitud.');
      console.error('Error enviando solicitud:', error.message);
    }
  };

  return (
    <ImageBackground source={require('../assets/logo.png')} style={styles.background}>  //imagen de logo de fondo
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Solicitud de Creación de Usuario</Text>

        {/* Datos del usuario */}
        <TextInput style={styles.input} placeholder="Cédula" value={userData.id_cedula} onChangeText={(text) => handleInputChange('id_cedula', text)} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Nombre" value={userData.nombre} onChangeText={(text) => handleInputChange('nombre', text)} />
        <TextInput style={styles.input} placeholder="Apellidos" value={userData.apellidos} onChangeText={(text) => handleInputChange('apellidos', text)} />
        <TextInput style={styles.input} placeholder="Teléfono" value={userData.telefono} onChangeText={(text) => handleInputChange('telefono', text)} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Correo" value={userData.correo} onChangeText={(text) => handleInputChange('correo', text)} keyboardType="email-address" />

        {/* Switch para empresa */}
        <View style={styles.switchContainer}>
          <Text style={styles.label}>¿Tiene una empresa registrada?</Text>
          <Switch value={hasCompany} onValueChange={(value) => setHasCompany(value)} />
        </View>

        {/* Datos de la empresa (si aplica) */}
        {hasCompany && (
          <>
            <TextInput style={styles.input} placeholder="Nombre de la Empresa" value={companyData.nombre} onChangeText={(text) => handleCompanyInputChange('nombre', text)} />
            <TextInput style={styles.input} placeholder="Cédula de la Empresa" value={companyData.cedula} onChangeText={(text) => handleCompanyInputChange('cedula', text)} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Teléfono de la Empresa" value={companyData.telefono} onChangeText={(text) => handleCompanyInputChange('telefono', text)} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Correo de la Empresa" value={companyData.correo} onChangeText={(text) => handleCompanyInputChange('correo', text)} keyboardType="email-address" />
          </>
        )}

        {/* Mostrar errores si los hay */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Botón de enviar */}
        <TouchableOpacity style={styles.button} onPress={handleCreateUserRequest}>
          <Text style={styles.buttonText}>Enviar Solicitud</Text>
        </TouchableOpacity>

        {/* Botón de volver */}
        <TouchableOpacity onPress={() => navigation.navigate('loginScreen')}>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};
//estilos para inputs  y texto
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#007bff',
  },
  input: {
    height: 50,
    width: '80%',
    borderColor: '#007bff',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#e9ecef',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#fdb813',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default CreateUserRequestScreen;
