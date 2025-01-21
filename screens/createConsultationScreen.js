import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const ConsultationScreen = ({ route }) => {
  const { user } = route.params; // Usuario logueado
  const [formData, setFormData] = useState({
    id_consulta: '',
    id_cedula: '',
    id_empresa: user.id_empresa, // Declarado, pero no visible
    tipoconsulta: '',
    valoracion: '',
    presion_arterial: '',
    frecuencia_cardiaca: '',
    saturacion_oxigeno: '',
    glicemia: '',
    frecuencia_respiratoria: '',
    plan_tratamiento: '',
    fecha_consulta: '',
    monto_consulta: '',
  });

  const [isEditing, setIsEditing] = useState(false); // Controla si los campos son editables
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado del modal
  const [patients, setPatients] = useState([]); // Lista de pacientes para el modal

  // Cargar datos desde la base de datos
  const fetchConsultationData = async () => {
    try {
      const response = await axios.get('http://192.168.1.98:3001/consultation');
      if (response.data.code === "200" && response.data.data.length > 0) {
        const consultation = response.data.data[0]; // Usamos la primera consulta para llenar los campos
        setFormData({
          ...formData,
          id_consulta: consultation.id_consulta.toString(),
          id_cedula: consultation.id_cedula,
          tipoconsulta: consultation.tipoconsulta,
          valoracion: consultation.valoracion,
          presion_arterial: consultation.presion_arterial,
          frecuencia_cardiaca: consultation.frecuencia_cardiaca,
          saturacion_oxigeno: consultation.saturacion_oxigeno,
          glicemia: consultation.glicemia,
          frecuencia_respiratoria: consultation.frecuencia_respiratoria,
          plan_tratamiento: consultation.plan_tratamiento,
          fecha_consulta: consultation.fecha_consulta.split('T')[0], // Solo la fecha
          monto_consulta: consultation.monto_consulta,
        });
      } else {
        // Si no hay consultas, cargar campos vacíos
        setFormData({
          id_consulta: '',
          id_cedula: '',
          id_empresa: user.id_empresa,
          tipoconsulta: '',
          valoracion: '',
          presion_arterial: '',
          frecuencia_cardiaca: '',
          saturacion_oxigeno: '',
          glicemia: '',
          frecuencia_respiratoria: '',
          plan_tratamiento: '',
          fecha_consulta: '',
          monto_consulta: '',
        });
        // Alert.alert('Aviso', 'No se encontraron consultas registradas.');
      }
    } catch (error) {
      console.error('Error al cargar los datos:', error.message);
      Alert.alert('Error', 'No se pudo cargar la consulta.');
    }
  };

  // Cargar pacientes desde el backend para el modal
  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://192.168.1.98:3001/patient');
      setPatients(response.data.data); // Asigna la lista de pacientes
    } catch (error) {
      console.error('Error al cargar los pacientes:', error.message);
      Alert.alert('Error', 'No se pudieron cargar los pacientes.');
    }
  };

  // Guardar consulta actualizada
  const handleSaveConsultation = async () => {
    try {
      // Validar datos antes de enviar
      if (!formData.id_consulta || !formData.id_cedula || !formData.tipoconsulta || !formData.plan_tratamiento || !formData.fecha_consulta) {
        Alert.alert('Error', 'Por favor complete todos los campos obligatorios.');
        return;
      }

      // Preparar datos para enviar al backend
      const payload = {
        id_consulta: parseInt(formData.id_consulta, 10),
        id_cedula: formData.id_cedula,
        id_empresa: formData.id_empresa,
        tipoconsulta: formData.tipoconsulta,
        valoracion: formData.valoracion,
        presion_arterial: formData.presion_arterial || '',
        frecuencia_cardiaca: formData.frecuencia_cardiaca || '',
        saturacion_oxigeno: formData.saturacion_oxigeno || '',
        glicemia: formData.glicemia || '',
        frecuencia_respiratoria: formData.frecuencia_respiratoria || '',
        plan_tratamiento: formData.plan_tratamiento,
        fecha_consulta: `${formData.fecha_consulta}T00:00:00.000Z`, // Transformar la fecha
        monto_consulta: formData.monto_consulta || '0.00',
        estado: 1, // Indicar que está activo
      };


      console.log("Datos que se enviarán al backend (payload):", payload);

      // Llamada al backend con pacht
      const response = await axios.patch(`http://192.168.1.98:3001/consultation`, payload);

      // Log para verificar la respuesta del servidor
      console.log("Respuesta del servidor:", response.data);

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Consulta actualizada exitosamente.');
        setIsEditing(false); // Deshabilitar edición
      } else {
        throw new Error('Error en la respuesta del servidor.');
      }
    } catch (error) {
      console.error('Error al guardar la consulta:', error.message);
      //Alert.alert('Error', 'No se pudo guardar la consulta.');
    }
  };

  // Finalizar consulta
  const handleFinalizeConsultation = async () => {
    try {
      const response = await axios.patch(`http://192.168.1.98:3001/consultation/${formData.id_consulta}`, { estado: 1 });
      if (response.status === 200 || response.status === 201) {
        setFormData({
          id_consulta: '',
          id_cedula: '',
          id_empresa: user.id_empresa,
          tipoconsulta: '',
          valoracion: '',
          presion_arterial: '',
          frecuencia_cardiaca: '',
          saturacion_oxigeno: '',
          glicemia: '',
          frecuencia_respiratoria: '',
          plan_tratamiento: '',
          fecha_consulta: '',
          monto_consulta: '',
        });
        setIsEditing(false);
        Alert.alert('Consulta Finalizada');
      }
    } catch (error) {
      console.error('Error al finalizar la consulta:', error.message);
      Alert.alert('Error', 'No se pudo finalizar la consulta.');
    }
  };

  // Manejar cambios en los campos
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Manejar cambios en los campos del modal
  const handleModalChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  // Manejar el envío del formulario del modal
  const handleModalSaveConsultation = async () => {
    try {
      if (!formData.tipoconsulta || !formData.valoracion || !formData.plan_tratamiento || !formData.fecha_consulta || !formData.monto_consulta) {
        Alert.alert('Error', 'Por favor complete todos los campos obligatorios.');
        return;
      }

      const response = await axios.post('http://192.168.1.98:3001/consultation', { ...formData, id_empresa: user.id_empresa });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Éxito', 'Consulta creada exitosamente.');
        setIsModalVisible(false);
        fetchConsultationData(); // Recargar la consulta creada
      }
    } catch (error) {
      console.error('Error al crear la consulta:', error.message);
      Alert.alert('Error', 'No se pudo crear la consulta. Inténtelo nuevamente.');
    }
  };

  // Cargar los datos al montar el componente
  useEffect(() => {
    fetchConsultationData();
    fetchPatients(); // Cargar pacientes al montar el componente
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consulta Médica</Text>

      <ScrollView>
        <TextInput
          style={[styles.input, styles.readOnly]} // Campo solo lectura
          value={
            patients.find((patient) => patient.id_cedula === formData.id_cedula)?.nombre || ''
          }
          editable={false}
          placeholder="Nombre del Paciente"
        />

        <TextInput
          style={[styles.input, styles.readOnly]} // Campo solo lectura
          value={formData.id_cedula}
          editable={false}
          onChangeText={(value) => handleChange('id_cedula', value)}
          placeholder="Cédula*"
        />

        <TextInput
          style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
          value={formData.tipoconsulta}
          editable={isEditing}
          onChangeText={(value) => handleChange('tipoconsulta', value)}
          placeholder="Tipo Consulta*"
        />

        <TextInput
          style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
          value={formData.valoracion}
          editable={isEditing}
          onChangeText={(value) => handleChange('valoracion', value)}
          placeholder="Valoración*"
        />

        <TextInput
          style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
          value={formData.presion_arterial}
          editable={isEditing}
          onChangeText={(value) => handleChange('presion_arterial', value)}
          placeholder="Presión Arterial (Opcional)"
        />

        <TextInput
          style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
          value={formData.frecuencia_cardiaca}
          editable={isEditing}
          onChangeText={(value) => handleChange('frecuencia_cardiaca', value)}
          placeholder="Frecuencia Cardíaca (Opcional)"
        />

        <TextInput
          style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
          value={formData.saturacion_oxigeno}
          editable={isEditing}
          onChangeText={(value) => handleChange('saturacion_oxigeno', value)}
          placeholder="Saturación de Oxígeno (Opcional)"
        />

        <TextInput
          style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
          value={formData.glicemia}
          editable={isEditing}
          onChangeText={(value) => handleChange('glicemia', value)}
          placeholder="Glicemia (Opcional)"
        />

        <TextInput
          style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
          value={formData.frecuencia_respiratoria}
          editable={isEditing}
          onChangeText={(value) => handleChange('frecuencia_respiratoria', value)}
          placeholder="Frecuencia Respiratoria (Opcional)"
        />

        <TextInput
          style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
          value={formData.plan_tratamiento}
          editable={isEditing}
          onChangeText={(value) => handleChange('plan_tratamiento', value)}
          placeholder="Plan de Tratamiento*"
        />

        <TextInput
          style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
          value={formData.fecha_consulta}
          editable={isEditing}
          onChangeText={(value) => handleChange('fecha_consulta', value)}
          placeholder="Fecha de Consulta*"
        />

        <TextInput
          style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
          value={formData.monto_consulta}
          editable={isEditing}
          onChangeText={(value) => handleChange('monto_consulta', value)}
          placeholder="Monto Consulta*"
          keyboardType="numeric"
        />
      </ScrollView>

      {/* Botones */}
      <View style={styles.buttonContainer}>
        {/* Botón para editar consulta */}
        <TouchableOpacity
          style={[
            styles.editButton,
            !formData.id_consulta && styles.disabledButton, // Deshabilitar si no hay datos
          ]}
          onPress={() => setIsEditing((prev) => !prev)} // Activar/desactivar edición
          disabled={!formData.id_consulta} // Deshabilitado si no hay datos
        >
          <Text style={styles.buttonText}>Editar Consulta</Text>
        </TouchableOpacity>

        {/* Botón para finalizar consulta */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            !formData.id_consulta && styles.disabledButton, // Deshabilitar si no hay datos
          ]}
          onPress={isEditing ? handleSaveConsultation : handleFinalizeConsultation}
          disabled={!formData.id_consulta} // Deshabilitado si no hay datos
        >
          <Text style={styles.buttonText}>
            {isEditing ? 'Finalizar Edición' : 'Finalizar Consulta'}
          </Text>
        </TouchableOpacity>

        {/* Botón para crear consulta */}
        <TouchableOpacity
          style={[
            styles.finalizeButton,
            formData.id_consulta && styles.disabledButton, // Deshabilitar si hay datos
          ]}
          onPress={() => setIsModalVisible(true)} // Mostrar modal al presionar
          disabled={!!formData.id_consulta} // Deshabilitado si hay datos
        >
          <Text style={styles.buttonText}>Crear Consulta</Text>
        </TouchableOpacity>
      </View>


      {/* Modal de creación de consulta */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Crear Consulta</Text>

            {/* Selector de pacientes */}
            <Text style={styles.label}>Paciente*:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.id_cedula}
                onValueChange={(value) => handleModalChange('id_cedula', value)}
              >
                <Picker.Item label="Selecciona un paciente" value="" />
                {patients.map((patient) => (
                  <Picker.Item
                    key={patient.id_cedula}
                    label={`${patient.nombre} ${patient.apellidos}`}
                    value={patient.id_cedula}
                  />
                ))}
              </Picker>
            </View>

            {/* Campos del formulario */}
            <TextInput
              style={styles.input}
              placeholder="Tipo Consulta*"
              value={formData.tipoconsulta}
              onChangeText={(value) => handleModalChange('tipoconsulta', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Valoración*"
              value={formData.valoracion}
              onChangeText={(value) => handleModalChange('valoracion', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Presión Arterial (Opcional)"
              value={formData.presion_arterial}
              onChangeText={(value) => handleModalChange('presion_arterial', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Frecuencia Cardíaca (Opcional)"
              value={formData.frecuencia_cardiaca}
              onChangeText={(value) => handleModalChange('frecuencia_cardiaca', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Saturación de Oxígeno (Opcional)"
              value={formData.saturacion_oxigeno}
              onChangeText={(value) => handleModalChange('saturacion_oxigeno', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Glicemia (Opcional)"
              value={formData.glicemia}
              onChangeText={(value) => handleModalChange('glicemia', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Frecuencia Respiratoria (Opcional)"
              value={formData.frecuencia_respiratoria}
              onChangeText={(value) => handleModalChange('frecuencia_respiratoria', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Plan de Tratamiento*"
              value={formData.plan_tratamiento}
              onChangeText={(value) => handleModalChange('plan_tratamiento', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Fecha Consulta* (YYYY-MM-DD)"
              value={formData.fecha_consulta}
              onChangeText={(value) => handleModalChange('fecha_consulta', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Monto Consulta*"
              keyboardType="numeric"
              value={formData.monto_consulta}
              onChangeText={(value) => handleModalChange('monto_consulta', value)}
            />

            {/* Botones de acción */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  // Cerrar el modal y limpiar los campos
                  setIsModalVisible(false);

                  // Restablecer los valores de formData a vacíos
                  setFormData({
                    id_consulta: '',
                    id_cedula: '',
                    id_empresa: user.id_empresa, // Si debe permanecer, mantenlo aquí
                    tipoconsulta: '',
                    valoracion: '',
                    presion_arterial: '',
                    frecuencia_cardiaca: '',
                    saturacion_oxigeno: '',
                    glicemia: '',
                    frecuencia_respiratoria: '',
                    plan_tratamiento: '',
                    fecha_consulta: '',
                    monto_consulta: '',
                  });
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleModalSaveConsultation}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Contenedor principal
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },

  // Título principal
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },

  // Estilos de entrada de texto
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  readOnly: {
    backgroundColor: '#e9ecef', // Fondo para campos no editables
  },
  editable: {
    backgroundColor: '#fff', // Fondo para campos editables
  },

  // Contenedor de botones
  buttonContainer: {
    flexDirection: 'row', // Botones en una fila
    justifyContent: 'space-between', // Separación uniforme
    marginTop: 20,
  },

  // Estilos de botones generales
  editButton: {
    backgroundColor: '#007bff', // Azul
    padding: 15,
    borderRadius: 8,
    flex: 1,


  },
  saveButton: {
    backgroundColor: '#28a745', // Verde
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,

  },
  finalizeButton: {
    backgroundColor: '#dc3545', // Rojo
    padding: 15,
    borderRadius: 8,
    flex: 1,

  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    width: '48%', // Botón más pequeño que los otros
  },

  // Texto de los botones
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%', // Ancho del modal
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },

  // Picker en el modal
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  disabledButton: {
    backgroundColor: '#6c757d', // Color gris para indicar deshabilitado
    opacity: 0.65,
  },
});

export default ConsultationScreen;
