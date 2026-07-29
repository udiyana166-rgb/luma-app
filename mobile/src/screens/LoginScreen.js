import { View, Text, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import api from '../api/client';
import Button from '../components/Button';
import { saveToken } from '../storage/token';
import { colors } from '../theme/colors';

const inputStyle = {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 12,
  padding: 14,
  marginTop: 12,
  fontSize: 16,
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!email || !password) {
      Alert.alert('Анхаар', 'Имэйл болон нууц үгээ оруулна уу');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      await saveToken(response.data.token);

      // Хэрэглэгч профайлтай эсэхийг шалгаад зөв дэлгэц рүү шилжинэ
      // (өмнөх хувилбарт үргэлж CreateProfile руу шилждэг байсан тул профайлтай хүн ч дахин профайл үүсгэх дэлгэц рүү орсон)
      try {
        await api.get('/profile');
        navigation.replace('Discover');
      } catch {
        navigation.replace('CreateProfile');
      }
    } catch (error) {
      // ЗАСВАР: өмнөх хувилбарт console.log хийгээд л дуусдаг байсан, хэрэглэгчид юу ч харагдаагүй
      const message = error.response?.data?.message || 'Нэвтрэхэд алдаа гарлаа';
      Alert.alert('Алдаа', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ padding: 30, marginTop: 80, backgroundColor: colors.background, flex: 1 }}>
      <Text style={{ fontSize: 32, fontWeight: '700' }}>Welcome Back 💗</Text>

      <TextInput
        style={inputStyle}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
      />
      <TextInput style={inputStyle} placeholder="Password" secureTextEntry onChangeText={setPassword} />

      <Button title="Login" onPress={login} loading={loading} />

      <Text style={{ textAlign: 'center', marginTop: 20, color: colors.primary }} onPress={() => navigation.navigate('Register')}>
        Create account
      </Text>
    </View>
  );
}
