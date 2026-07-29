import { View, Text, TextInput, ScrollView, Alert } from 'react-native';
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

export default function CreateProfileScreen({ navigation }) {
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);

  async function create() {
    const ageNum = Number(age);
    if (!ageNum || ageNum < 18) {
      Alert.alert('Анхаар', 'Нас 18-аас дээш байх ёстой');
      return;
    }
    setLoading(true);
    try {
      await api.post('/profile', { age: ageNum, city, bio, relationshipGoal: goal });
      // ЗАСВАР: өмнөх урсгалд PhotoUpload screen байсан ч хэзээ ч дуудагддаггүй байсан —
      // одоо профайл үүсгэсний дараа шууд зураг оруулах дэлгэц рүү шилжинэ
      navigation.replace('PhotoUpload');
    } catch (error) {
      Alert.alert('Алдаа', error.response?.data?.message || 'Профайл үүсгэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={{ padding: 30, marginTop: 60, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 30, fontWeight: '700' }}>Create Profile 💗</Text>

      <TextInput style={inputStyle} placeholder="Age" keyboardType="numeric" onChangeText={setAge} />
      <TextInput style={inputStyle} placeholder="City" onChangeText={setCity} />
      {/* ЗАСВАР: эх кодонд энд <TextInput> биш зүгээр "TextInput" гэж бичигдсэн байсан
          (эхний "<" дутуу) — энэ нь JSX parse алдаа шидэж, апп угаас ачаалахгүй байсан */}
      <TextInput style={inputStyle} placeholder="About you" multiline onChangeText={setBio} />
      <TextInput style={inputStyle} placeholder="Looking for..." onChangeText={setGoal} />

      <Button title="Continue" onPress={create} loading={loading} />
    </ScrollView>
  );
}
