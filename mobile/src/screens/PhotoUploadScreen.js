import { View, Text, Image, Alert } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Button from '../components/Button';
import api from '../api/client';
import { colors } from '../theme/colors';

export default function PhotoUploadScreen({ navigation }) {
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Зөвшөөрөл хэрэгтэй', 'Зураг сонгохын тулд галерейд хандах зөвшөөрөл өгнө үү');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  async function upload() {
    if (!image) {
      Alert.alert('Анхаар', 'Эхлээд зураг сонгоно уу');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('image', {
      uri: image,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });

    try {
      // ЗАСВАР: энэ endpoint (/upload/photo) эх кодонд огт байгаагүй тул энэ дуудалт
      // үргэлж алдаатай (404) буцдаг байсан
      await api.post('/upload/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigation.navigate('Discover');
    } catch (error) {
      Alert.alert('Алдаа', error.response?.data?.message || 'Зураг upload хийхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ padding: 30, marginTop: 60, backgroundColor: colors.background, flex: 1 }}>
      <Text style={{ fontSize: 30, fontWeight: '700' }}>Add Photo 📸</Text>

      <Button title="Choose Photo" onPress={pickImage} />

      {image && (
        <Image source={{ uri: image }} style={{ width: 200, height: 200, borderRadius: 100, marginTop: 20, alignSelf: 'center' }} />
      )}

      <Button title="Upload" onPress={upload} loading={loading} disabled={!image} />
    </View>
  );
}
