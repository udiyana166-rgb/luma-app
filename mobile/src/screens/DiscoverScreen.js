import { View, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Swiper from 'react-native-deck-swiper';
import api from '../api/client';
import { clearToken } from '../storage/token';
import ProfileCard from '../components/ProfileCard';
import { colors } from '../theme/colors';

export default function DiscoverScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const response = await api.get('/discovery');
      setUsers(response.data);
    } finally {
      setLoading(false);
    }
  }

  // Match хийгээд Chat-руу орсны дараа буцаж ирэхэд discovery feed шинэчлэгдэнэ
  useFocusEffect(useCallback(() => { load(); }, []));

  async function like(index) {
    const target = users[index];
    try {
      const response = await api.post('/swipe', { targetUserId: target.id, action: 'LIKE' });
      // ЗАСВАР: өмнөх хувилбарт match хийгдсэн ч хариуг зүгээр үл тоомсорлодог байсан
      if (response.data.match) {
        navigation.navigate('Match', { otherUser: response.data.otherUser, matchId: response.data.match.id });
      }
    } catch (error) {
      console.error('Swipe error', error);
    }
  }

  async function pass(index) {
    const target = users[index];
    try {
      await api.post('/swipe', { targetUserId: target.id, action: 'PASS' });
    } catch (error) {
      console.error('Swipe error', error);
    }
  }

  async function handleLogout() {
    await clearToken();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  return (
    <View style={{ flex: 1, paddingTop: 50, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 32, fontWeight: '700' }}>Discover 💗</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={{ color: colors.muted, marginTop: 12 }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Matches')}>
        <Text style={{ textAlign: 'center', color: colors.primary, marginVertical: 8 }}>Миний Match-үүд →</Text>
      </TouchableOpacity>

      {!loading && users.length === 0 && (
        <Text style={{ textAlign: 'center', marginTop: 60, color: colors.muted }}>
          Одоогоор шинэ хэрэглэгч алга. Дараа дахин шалгана уу.
        </Text>
      )}

      <Swiper
        cards={users}
        renderCard={(card) => (card ? <ProfileCard user={card} /> : null)}
        onSwipedRight={like}
        onSwipedLeft={pass}
        stackSize={3}
        backgroundColor="transparent"
      />
    </View>
  );
}
