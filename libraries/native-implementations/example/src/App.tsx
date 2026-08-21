import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { showConfirmDialog } from 'react-native-native-implementations';

export default function App() {
  const [status, setStatus] = useState('Esperando confirmación');

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{status}</Text>
      <Pressable
        style={styles.button}
        onPress={() => {
          setStatus('Dialog abierto');
          showConfirmDialog({
            title: 'Confirmar acción',
            message: '¿Quieres continuar?',
            confirmText: 'Sí, continuar',
            cancelText: 'No, volver',
            onPress: () => setStatus('Aceptado'),
            onCancel: () => setStatus('Cancelado'),
          });
        }}
      >
        <Text style={styles.buttonText}>Mostrar dialog</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  status: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
