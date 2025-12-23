import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { X, Send, MessageCircle } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../utils/theme';

export default function ChatBubble({ visible, onClose, user }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      text: 'Olá! Como posso ajudar você hoje?',
      time: new Date(),
    },
  ]);

  useEffect(() => {
    if (visible) {
      // Reset para 0 antes de animar
      scaleAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      text: message.trim(),
      time: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simular resposta automática
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'system',
          text: 'Obrigado pela sua mensagem! Em breve um atendente entrará em contato.',
          time: new Date(),
        },
      ]);
    }, 1000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.chatContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: scaleAnim,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerInfo}>
                <View style={styles.headerIcon}>
                  <MessageCircle size={24} color={colors.white} />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Suporte</Text>
                  <Text style={styles.headerSubtitle}>Online</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageBubble,
                    msg.type === 'user' ? styles.userMessage : styles.systemMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.type === 'user' ? styles.userMessageText : styles.systemMessageText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      msg.type === 'user' ? styles.userMessageTime : styles.systemMessageTime,
                    ]}
                  >
                    {formatTime(msg.time)}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Digite sua mensagem..."
                placeholderTextColor={colors.gray[400]}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!message.trim()}
              >
                <Send size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 350,
  },
  chatContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    minHeight: 300,
    maxHeight: 500,
    ...shadows.lg,
  },
  header: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.base,
    color: colors.white,
    fontFamily: 'GriftBold',
  },
  headerSubtitle: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Grift',
  },
  closeButton: {
    padding: spacing.xs,
  },
  messagesContainer: {
    flex: 1,
    minHeight: 150,
  },
  messagesContent: {
    padding: spacing.md,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  systemMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray[100],
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.secondary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  systemMessageText: {
    color: colors.primary,
    fontFamily: 'Grift',
  },
  userMessageText: {
    color: colors.white,
    fontFamily: 'Grift',
  },
  messageTime: {
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  systemMessageTime: {
    color: colors.gray[500],
    fontFamily: 'Grift',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Grift',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    fontFamily: 'Grift',
    color: colors.primary,
    maxHeight: 80,
    marginRight: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
});
