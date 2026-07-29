import { View, Text, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import api from '../api/client';
import Button from '../components/Button';
import { colors } from '../theme/colors';

const inputStyle = {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 12,
  padding: 14,
  marginTop: 12,
  fontSize: 16,
};

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function register() {
    if (!email || !username || !password) {
      Alert.alert('Анхаар', 'Бүх талбарыг бөглөнө үү');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', { email, username, password });
      Alert.alert('Амжилттай', 'Бүртгэл үүслээ! Одоо нэвтэрнэ үү.');
      navigation.navigate('Login');
    } catch (error) {
      // ЗАСВАР: өмнөх хувилбарт алдаа гарвал хэрэглэгч юу ч харахгүй байсан
      const message = error.response?.data?.message || 'Бүртгүүлэхэд алдаа гарлаа';
      Alert.alert('Алдаа', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ padding: 30, marginTop: 80, backgroundColor: colors.background, flex: 1 }}>
      <Text style={{ fontSize: 32, fontWeight: '700' }}>Join Luma 💗</Text>

      <TextInput
        style={inputStyle}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
      />
      <TextInput style={inputStyle} placeholder="Username" autoCapitalize="none" onChangeText={setUsername} />
      <TextInput style={inputStyle} placeholder="Password" secureTextEntry onChangeText={setPassword} />

      <Button title="Create Account" onPress={register} loading={loading} />

      <Text style={{ textAlign: 'center', marginTop: 20, color: colors.primary }} onPress={() => navigation.navigate('Login')}>
        Already have an account? Login
      </Text>
    </View>
  );
}
