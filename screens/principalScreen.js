import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const MenuWithIconsAndLogo = ({ navigation, route }) => {
  const { user } = route.params;

  return (
    <View style={styles.container}>
      {/* Texto de bienvenida */}
      <Text style={styles.welcomeText}>
        Bienvenido: {user.nombre} {user.apellidos}
      </Text>

      {/* Menú con íconos */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('userProfile', { user })}
        >
          <FontAwesome name="user" size={24} color="black" />
          <Text style={styles.menuText}>Perfil Profesional</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('agendaScreen',{ user })}
        >
          <FontAwesome name="calendar" size={24} color="black" />
          <Text style={styles.menuText}>Agenda</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('patientScreen',{ user })}
        >
          <FontAwesome name="users" size={24} color="black" />
          <Text style={styles.menuText}>Pacientes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('ReportesScreen')}
        >
          <FontAwesome name="file" size={24} color="black" />
          <Text style={styles.menuText}>Reportes</Text>
        </TouchableOpacity>
      </View>

      {/* Imagen de fondo en la parte inferior */}
      <ImageBackground
        source={require('../assets/logo.png')} // Imagen de fondo
        style={styles.background}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'space-between', // Distribuir elementos
  },
  background: {
    height: 200, // Altura de la imagen
    justifyContent: 'center', // Centrar contenido dentro de la imagen (si se agrega más adelante)
    alignItems: 'center',
    resizeMode: 'cover', // Ajustar la imagen al tamaño del contenedor
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000', // Color del texto
    marginTop: 20,
    textAlign: 'center',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#e0f7fa',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default MenuWithIconsAndLogo;
