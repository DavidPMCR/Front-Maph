import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import axios from 'axios';

const UserProfile = ({ route, navigation }) => {
  const { user } = route.params; // Obtén los datos del usuario desde los parámetros de la ruta
  const [isEditing, setIsEditing] = useState(false); // Controla si se puede editar el formulario
  const [formData, setFormData] = useState({ ...user }); // Inicializa los datos del formulario

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleEdit = () => {
    setIsEditing(true); // Habilita la edición
  };

  const handleAccept = async () => {
    try {
      const response = await axios.patch(`http://192.168.1.98:3001/user`, formData);
      if (response.status === 200) {
        alert('Datos actualizados exitosamente');
        setIsEditing(false); // Deshabilita la edición
        navigation.navigate('principalScreen', { user: formData }); // Actualiza los datos en la pantalla principal
      }
    } catch (error) {
      console.error('Error al actualizar los datos:', error.message);
      alert('Hubo un problema al actualizar los datos');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil Profesional</Text>

      <TextInput
        style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
        value={formData.nombre}
        editable={isEditing}
        onChangeText={(text) => handleInputChange('nombre', text)}
        placeholder="Nombre"
      />

      <TextInput
        style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
        value={formData.apellidos}
        editable={isEditing}
        onChangeText={(text) => handleInputChange('apellidos', text)}
        placeholder="Apellidos"
      />

      <TextInput
        style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
        value={formData.id_cedula}
        editable={false} // La cédula no debe ser editable
        placeholder="Cédula"
      />

      <TextInput
        style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
        value={formData.telefono}
        editable={isEditing}
        onChangeText={(text) => handleInputChange('telefono', text)}
        placeholder="Teléfono"
      />

      <TextInput
        style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
        value={formData.correo}
        editable={isEditing}
        onChangeText={(text) => handleInputChange('correo', text)}
        placeholder="Correo"
      />

      <View style={styles.buttonContainer}>
        {!isEditing ? (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
            <Text style={styles.buttonText}>Aceptar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Imagen de fondo en la parte inferior */}
      <ImageBackground
        source={require('../assets/logo.png')} // Ruta de la imagen
        style={styles.background}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    color: '#333',
  },
  readOnly: {
    backgroundColor: '#e9ecef',
  },
  editable: {
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  background: {
    height: 200, // Altura de la imagen en la parte inferior
    justifyContent: 'center', // Centrar contenido dentro de la imagen
    alignItems: 'center',
    resizeMode: 'cover', // Ajustar la imagen al contenedor
    marginTop: 20,
  },
});

export default UserProfile;
