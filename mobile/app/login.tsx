import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EVibe</Text>
      <Text style={styles.subtitle}>Welcome back</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={() => router.replace('/home')}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={styles.link}>Don't have an account? <Text style={styles.linkBold}>Sign Up</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', paddingHorizontal: 28 },
  title: { fontSize: 40, fontWeight: 'bold', color: '#22c55e', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 36 },
  input: { backgroundColor: '#1e293b', color: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, fontSize: 15 },
  button: { backgroundColor: '#22c55e', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 6, marginBottom: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#94a3b8', textAlign: 'center', fontSize: 14 },
  linkBold: { color: '#22c55e', fontWeight: 'bold' },
});
