import { View, Text, Image } from 'react-native';
import { colors } from '../theme/colors';

export default function ProfileCard({ user }) {
  const mainPhoto = user.photos?.find((p) => p.isMain) || user.photos?.[0];

  return (
    <View style={{ height: 600, backgroundColor: '#fff', borderRadius: 30, overflow: 'hidden' }}>
      {mainPhoto ? (
        <Image source={{ uri: mainPhoto.url }} style={{ height: '70%', width: '100%' }} />
      ) : (
        // ЗАСВАР: зурагтай хэрэглэгч байхгүй үед хоосон/эвдэрсэн зураг харагдахаас сэргийлнэ
        <View
          style={{
            height: '70%',
            width: '100%',
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 48, fontWeight: '700', color: colors.primary }}>
            {user.username?.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: '700' }}>
          {user.username}
          {user.profile?.age && `, ${user.profile.age}`}
        </Text>
        <Text style={{ color: colors.muted }}>{user.profile?.city}</Text>
        <Text style={{ marginTop: 6 }}>{user.profile?.bio}</Text>
      </View>
    </View>
  );
}
