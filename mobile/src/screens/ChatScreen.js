import { View, Text, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import api from '../api/client';
import Button from '../components/Button';
import { colors } from '../theme/colors';
import { getToken } from '../storage/token';
// jwt-decode ашиглан өөрийн userId-г token-оос гаргаж авна (aль зурвас "миний" эсэхийг мэдэхийн тулд)
import { jwtDecode } from 'jwt-decode';

export default function ChatScreen({ route }) {
  const { matchId, otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [myUserId, setMyUserId] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function setup() {
      const token = await getToken();
      if (token && mounted) setMyUserId(jwtDecode(token).id);

      await loadMessages();
      // ЗАСВАР: өмнөх хувилбарт backend огт дуудагддаггүй байсан.
      // Жинхэнэ WebSocket байхгүй тул энгийн polling ашиглав (3 секунд тутам).
      pollRef.current = setInterval(loadMessages, 3000);
    }
    setup();

    return () => {
      mounted = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [matchId]);

  async function loadMessages() {
    try {
      const response = await api.get(`/messages/${matchId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Load messages error', error);
    }
  }

  async function send() {
    if (!text.trim()) return;
    const content = text.trim();
    setText('');
    try {
      await api.post('/messages', { matchId, text: content });
      await loadMessages();
    } catch (error) {
      console.error('Send message error', error);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={{ fontSize: 20, fontWeight: '700', padding: 16 }}>{otherUser?.username}</Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: item.senderId === myUserId ? 'flex-end' : 'flex-start',
              backgroundColor: item.senderId === myUserId ? colors.primary : '#fff',
              padding: 10,
              borderRadius: 14,
              marginVertical: 4,
              maxWidth: '75%',
            }}
          >
            <Text style={{ color: item.senderId === myUserId ? '#fff' : colors.text }}>{item.text}</Text>
          </View>
        )}
      />

      <View style={{ flexDirection: 'row', padding: 12, alignItems: 'center' }}>
        <TextInput
          placeholder="Message..."
          value={text}
          onChangeText={setText}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 10,
            marginRight: 10,
          }}
        />
        <View style={{ width: 100 }}>
          <Button title="Send" onPress={send} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
