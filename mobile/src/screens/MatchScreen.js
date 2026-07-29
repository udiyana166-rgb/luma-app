import { View, Text, Image } from 'react-native';
import Button from '../components/Button';
import { colors } from '../theme/colors';

export default function MatchScreen({ route, navigation }) {
  const { otherUser } = route.params;
  const photo = otherUser?.photos?.[0]?.url;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 20 }}>
      <Text style={{ fontSize: 40, fontWeight: '800', color: colors.primary }}>It's a Match 💗</Text>

      {photo ? (
        // ЗАСВАР: эх кодонд user.photos[0].url гэж шууд хандаж байсан тул
        // зурагтай хэрэглэгч байхгүй үед app crash хийдэг байсан
        <Image source={{ uri: photo }} style={{ width: 180, height: 180, borderRadius: 90, marginTop: 20 }} />
      ) : (
        <View
          style={{
            width: 180, height: 180, borderRadius: 90, marginTop: 20,
            backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 56, fontWeight: '700', color: colors.primary }}>
            {otherUser?.username?.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <Text style={{ fontSize: 20, marginTop: 16 }}>You matched with {otherUser?.username}</Text>

      <Button
        title="Chat 💬"
        onPress={() =>
          navigation.replace('Chat', {
            matchId: route.params.matchId,
            otherUser,
          })
        }
      />
    </View>
  );
}
