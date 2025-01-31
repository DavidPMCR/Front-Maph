import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import MaskInput from 'react-native-mask-input';
import axios from 'axios';

const FileUpload = ({ route }) => {
  const { user } = route.params; // Información del usuario logueado
  const { control, handleSubmit, reset } = useForm(); // Añadimos `reset` para limpiar campos
  const [patients, setPatients] = useState([]); // Lista de pacientes
  const [selectedPatient, setSelectedPatient] = useState(''); // Paciente seleccionado
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);

  // Cargar pacientes desde el backend
  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://192.168.1.98:3001/patient');
      setPatients(response.data.data);
    } catch (error) {
      console.error('Error al cargar pacientes:', error.message);
      Alert.alert('Error', 'No se pudieron cargar los pacientes.');
    }
  };

  // Solicitar permisos de galería
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para seleccionar archivos.');
    }
  };

  useEffect(() => {
    requestPermission();
    fetchPatients();
  }, []);

  const pickImage = async (setFile) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      setFile({
        uri: file.uri,
        name: file.uri.split('/').pop(),
        type: 'image/jpeg',
      });
      console.log('Imagen seleccionada:', file);
    } else {
      console.log('Selección cancelada o fallida');
    }
  };

  const onSubmit = async (data) => {
    // Validar que todos los campos estén completos
    if (!selectedPatient) {
      Alert.alert('Error', 'Por favor seleccione un paciente.');
      return;
    }

    if (!data.fecha) {
      Alert.alert('Error', 'Por favor ingrese una fecha.');
      return;
    }

    if (!data.detalle) {
      Alert.alert('Error', 'Por favor escriba un detalle.');
      return;
    }

    if (!image1 && !image2 && !image3) {
      Alert.alert('Error', 'Debe seleccionar al menos un archivo para subir.');
      return;
    }

    // Crear el objeto FormData
    const formData = new FormData();

    // Adjunta las imágenes si están presentes
    if (image1) {
      formData.append('image1', {
        uri: image1.uri,
        name: image1.name,
        type: image1.type,
      });
    }
    if (image2) {
      formData.append('image2', {
        uri: image2.uri,
        name: image2.name,
        type: image2.type,
      });
    }
    if (image3) {
      formData.append('image3', {
        uri: image3.uri,
        name: image3.name,
        type: image3.type,
      });
    }

    // Adjunta el resto de los datos
    formData.append('id_empresa', user.id_empresa); // Asignar id_empresa del usuario
    formData.append('id_cedula', selectedPatient); // Cédula del paciente seleccionado
    formData.append('fecha', data.fecha);
    formData.append('detalle', data.detalle);

    try {
      const response = await axios.post('http://192.168.1.98:3001/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Alert.alert('Éxito', 'Archivos subidos correctamente.');
      console.log('Respuesta del servidor:', response.data);

      // Limpiar campos después de la subida exitosa
      setSelectedPatient('');
      reset({ fecha: '', detalle: '' }); // Limpia los campos manejados por `react-hook-form`
      setImage1(null);
      setImage2(null);
      setImage3(null);
    } catch (error) {
      console.error('Error al subir archivo:', error.message);
      Alert.alert('Error', 'No se pudo subir el archivo.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Subir archivos de un paciente</Text>

      {/* Seleccionar Paciente */}
      <Text style={styles.label}>Seleccione un Paciente:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedPatient}
          onValueChange={(value) => setSelectedPatient(value)}
        >
          <Picker.Item label="Seleccione un paciente" value="" />
          {patients.map((patient) => (
            <Picker.Item
              key={patient.id_cedula}
              label={`${patient.nombre} ${patient.apellidos}`}
              value={patient.id_cedula}
            />
          ))}
        </Picker>
      </View>

      {/* Campo de Fecha con Máscara */}
      <Text style={styles.label}>Fecha:</Text>
      <Controller
        control={control}
        name="fecha"
        render={({ field: { onChange, value } }) => (
          <MaskInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            mask={[/\d/, /\d/, /\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/]} // Máscara AAAA/MM/DD
            placeholder="AAAA/MM/DD"
          />
        )}
      />

      {/* Campo de Detalle */}
      <Text style={styles.label}>Detalle:</Text>
      <Controller
        control={control}
        name="detalle"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={value}
            onChangeText={onChange}
            multiline
            placeholder="Escriba el detalle aquí"
          />
        )}
      />

      {/* Botones para Subir Imágenes */}
      <TouchableOpacity
        onPress={() => pickImage(setImage1)}
        style={styles.uploadButton}
      >
        <Text style={styles.buttonText}>Seleccionar Imagen 1</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => pickImage(setImage2)}
        style={styles.uploadButton}
      >
        <Text style={styles.buttonText}>Seleccionar Imagen 2</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => pickImage(setImage3)}
        style={styles.uploadButton}
      >
        <Text style={styles.buttonText}>Seleccionar Imagen 3</Text>
      </TouchableOpacity>

      {/* Botón de Enviar */}
      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        style={styles.submitButton}
      >
        <Text style={styles.submitButtonText}>Subir</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#d6d8db', // Color grisáceo
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default FileUpload;
