import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

export default function Button({ title, onPress, loading, disabled }) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={{
        backgroundColor: isDisabled ? colors.muted : colors.primary,
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 12,
      }}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={{ color: 'white', fontWeight: '700' }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
