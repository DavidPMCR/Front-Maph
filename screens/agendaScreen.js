import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';


const AgendaScreen = ({ navigation, route }) => {

  const { user } = route.params; //le paso los parametros del usuario logueado atraves de user para poder usarlos
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [patients, setPatients] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    id_empresa: user.id_empresa, // Usa el id_empresa del usuario logueado
    id_cedula_usuario: user.id_cedula, // Usa el id_cedula_usuario del usuario logueado
    id_cedula_paciente: '',
    fecha: '',
    hora_inicio: '',
    hora_final: '',
  });

  // Cargar citas desde el backend
  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://192.168.1.98:3001/diary');
      const loadedEvents = response.data.data.map((event) => ({
        id: event.numero_cita.toString(),
        date: event.fecha.split('T')[0],
        title: `${event.nombre_usuario} - ${event.nombre_paciente}`,
        time: `${event.hora_inicio} - ${event.hora_final}`,
      }));
      setEvents(loadedEvents);

    } catch (error) {
      console.error('Error al cargar las citas:', error.message);
      Alert.alert('Error', 'No se pudieron cargar las citas.');
    }
  };

  // Cargar pacientes desde el backend
  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://192.168.1.98:3001/patient');
      setPatients(response.data.data); // Ajuste aquí para asignar el arreglo correcto
      console.log('Pacientes:', response.data.data);
    } catch (error) {
      console.error('Error al cargar los pacientes:', error.message);
      Alert.alert('Error', 'No se pudieron cargar los pacientes.');
    }
  };


  // Guardar nueva cita
  const handleSaveAppointment = async () => {
    try {
      const response = await axios.post('http://192.168.1.98:3001/diary', newAppointment);
      if (response.status === 200 || response.status === 201) {
        Alert.alert('Éxito', 'Cita creada exitosamente.')


        setIsModalVisible(false);
        fetchEvents(); // Recargar las citas
      }
    } catch (error) {
      console.error('Error al crear la cita:', error.message);
      Alert.alert('Error', 'No se pudo crear la cita. Verifica los datos.');
    }
  };

  //elimnar la cita

  const handleDeleteAppointment = async (id) => {
    try {
      const response = await axios.delete(`http://192.168.1.98:3001/diary/${id}`);
      if (response.status === 200) {
        Alert.alert('Éxito', 'La cita ha sido eliminada.');
        fetchEvents(); // Recargar las citas después de eliminar
      }
    } catch (error) {
      console.error('Error al eliminar la cita:', error.message);
      Alert.alert('Error', 'No se pudo eliminar la cita. Inténtalo nuevamente.');
    }
  };


  // Al seleccionar un día
  const handleDatePress = (date) => {
    setSelectedDate(date);
    setNewAppointment({
      ...newAppointment,
      fecha: date, // Actualizar fecha en la nueva cita
    });
  };

  // Mostrar los eventos del día seleccionado
  const renderEventItem = ({ item }) => {
    if (item.date === selectedDate) {
      return (
        <TouchableOpacity
          style={styles.eventItem}
          onPress={() => navigation.navigate('createConsultationScreen', { user })} // Navegación directa
        >
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>Asignado: {item.title.split(' - ')[0]}</Text>
            <Text style={styles.eventTitle}>Paciente: {item.title.split(' - ')[1]}</Text>
            <Text style={styles.eventTime}>Hora: {item.time}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteAppointment(item.id)}
          >
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }
    return null;
  };



  // Cargar eventos y pacientes al montar el componente
  useEffect(() => {
    fetchEvents();
    fetchPatients();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda</Text>
      

      {/* Calendario */}
      <Calendar
        onDayPress={(day) => handleDatePress(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#007bff' },
          ...events.reduce((acc, event) => {
            acc[event.date] = { marked: true, dotColor: '#007bff' };
            return acc;
          }, {}),
        }}
        theme={{
          selectedDayBackgroundColor: '#007bff',
          todayTextColor: '#007bff',
          arrowColor: '#007bff',
        }}
      />

      {/* Lista de eventos */}
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        style={styles.eventList}
        ListEmptyComponent={
          selectedDate && (
            <Text style={styles.noEventsText}>No hay eventos para esta fecha.</Text>

          )

        }
      />

      {/* Botón para crear nueva cita */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Crear Cita</Text>
      </TouchableOpacity>

      {/* Modal para crear cita */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Cita</Text>

            {/* Etiqueta de usuario */}
            <Text>Asignado:</Text>
            <Text style={styles.assignedUser}>{`${user.nombre} ${user.apellidos}`}</Text>

            {/* Campo de paciente */}
            <Text>Paciente:</Text>
            <View style={styles.pickerContainer}>
              {patients.length > 0 ? (
                <Picker
                  selectedValue={newAppointment.id_cedula_paciente}
                  onValueChange={(itemValue) =>
                    setNewAppointment({ ...newAppointment, id_cedula_paciente: itemValue })
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Selecciona un paciente" value="" />
                  {patients.map((patient) => (
                    <Picker.Item key={patient.id_cedula} label={`${patient.nombre} ${patient.apellidos}   conocid@ como: ${patient.conocido_como}`} value={patient.id_cedula} />
                  ))}
                </Picker>
              ) : (
                <Text></Text>
              )}
            </View>


            {/* Campo de hora inicial */}
            <Text>Hora Inicial:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newAppointment.hora_inicio}
                onValueChange={(itemValue) =>
                  setNewAppointment({ ...newAppointment, hora_inicio: itemValue })
                }
                style={styles.picker}
              >
                <Picker.Item label="Selecciona la hora inicial" value="" />
                {Array.from({ length: 24 }, (_, i) => (
                  <Picker.Item key={i} label={`${i}:00`} value={`${i}:00`} />
                ))}
              </Picker>
            </View>

            {/* Campo de hora final */}
            <Text>Hora Final:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newAppointment.hora_final}
                onValueChange={(itemValue) =>
                  setNewAppointment({ ...newAppointment, hora_final: itemValue })
                }
                style={styles.picker}
              >
                <Picker.Item label="Selecciona la hora final" value="" />
                {Array.from({ length: 24 }, (_, i) => (
                  <Picker.Item key={i} label={`${i}:00`} value={`${i}:00`} />
                ))}
              </Picker>
            </View>

            {/* Botones del modal */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAppointment}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    color: '#333',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  eventList: {
    marginTop: 20,
  },
  eventItem: {
    padding: 15,
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
  },
  noEventsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  addButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#28a745',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    width: '48%',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    width: '48%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  //elimar cita boto y estilos render
  eventItem: {
    flexDirection: 'row', // Colocar elementos en una fila
    alignItems: 'center', // Centrar elementos verticalmente
    padding: 15,
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
    marginBottom: 10,
  },

  eventInfo: {
    flex: 1, // Ocupa el espacio disponible para la información
  },

  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    alignItems: 'center',
  },

  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },


});

export default AgendaScreen;
