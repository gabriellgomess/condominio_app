import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, fontSize } from '../utils/theme';

const logoFull = require('../../assets/logo_full.png');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      const errorMessage = result.message || 'Erro ao fazer login';
      const errorDetail = result.error ? `\n\nDetalhes: ${result.error}` : '';
      Alert.alert('Erro no Login', errorMessage + errorDetail);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header Preto */}
      <View style={styles.header}>
        <Text style={styles.headerWelcome}>Boas-vindas ao</Text>
        <Image source={logoFull} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.headerSubtext}>Faça login abaixo para acessar sua conta</Text>
      </View>

      {/* Conteúdo */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.cardContainer}>
          {/* Card de Login */}
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>Login</Text>

            <TextInput
              style={styles.input}
              placeholder="CPF ou Email"
              placeholderTextColor={colors.gray[400]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={colors.gray[400]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  headerWelcome: {
    fontSize: fontSize.lg,
    color: colors.white,
    fontFamily: 'Grift',
    marginBottom: spacing.sm,
  },
  headerLogo: {
    width: 200,
    height: 50,
  },
  headerSubtext: {
    fontSize: fontSize.sm,
    color: colors.gray[400],
    fontFamily: 'Grift',
    marginTop: spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  cardContainer: {
    alignItems: 'center',
  },
  loginCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.secondary,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loginTitle: {
    fontSize: fontSize.xl,
    color: colors.primary,
    fontFamily: 'GriftBold',
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    padding: spacing.md,
    fontSize: fontSize.base,
    fontFamily: 'Grift',
    marginBottom: spacing.md,
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontFamily: 'GriftBold',
  },
  forgotPassword: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    fontFamily: 'Grift',
  },
});
