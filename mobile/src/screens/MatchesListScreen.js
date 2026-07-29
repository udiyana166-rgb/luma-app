import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { colors } from '../theme/colors';

export default function MatchesListScreen({ navigation }) {
  const [matches, setMatches] = useState([]);

  useFocusEffect(
    useCallback(() => {
      api.get('/matches').then((res) => setMatches(res.data));
    }, [])
  );

  return (
    <View style={{ flex: 1, paddingTop: 50, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 28, fontWeight: '700', paddingHorizontal: 20, marginBottom: 10 }}>
        Таарсан хүмүүс
      </Text>

      {matches.length === 0 && (
        <Text style={{ textAlign: 'center', marginTop: 40, color: colors.muted }}>
          Одоогоор match алга. Swipe хийж эхэлээрэй!
        </Text>
      )}

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}
            onPress={() => navigation.navigate('Chat', { matchId: item.id, otherUser: item.otherUser })}
          >
            {item.otherUser?.photos?.[0] ? (
              <Image
                source={{ uri: item.otherUser.photos[0].url }}
                style={{ width: 54, height: 54, borderRadius: 27, marginRight: 14 }}
              />
            ) : (
              <View
                style={{
                  width: 54, height: 54, borderRadius: 27, marginRight: 14,
                  backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center',
                }}
              >
                <Text style={{ fontWeight: '700', color: colors.primary }}>
                  {item.otherUser?.username?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.otherUser?.username}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
