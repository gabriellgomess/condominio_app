import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Megaphone, CalendarDays, ChevronRight } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../utils/theme';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá,</Text>
          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Bem-vindo ao Condomínio App!</Text>
          <Text style={styles.welcomeText}>
            Esta é a tela inicial do aplicativo. Aqui você terá acesso a todas as funcionalidades do condomínio.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informações do Usuário</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome:</Text>
            <Text style={styles.infoValue}>{user?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>E-mail:</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          {/* <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nível de Acesso:</Text>
            <Text style={styles.infoValue}>{user?.access_level_name}</Text>
          </View> */}
        </View>

        {/* Menu de Funcionalidades */}
        <View style={styles.menuCard}>
          <Text style={styles.menuTitle}>Funcionalidades</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Incidents')}
          >
            <View style={styles.menuIcon}>
              <AlertTriangle size={24} color={colors.secondary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuItemTitle}>Ocorrências</Text>
              <Text style={styles.menuItemDescription}>Registre e acompanhe ocorrências do condomínio</Text>
            </View>
            <ChevronRight size={24} color={colors.gray[400]} />
          </TouchableOpacity>

          {/* Outros itens do menu (em breve) */}
          <View style={[styles.menuItem, styles.menuItemDisabled]}>
            <View style={styles.menuIcon}>
              <Megaphone size={24} color={colors.secondary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuItemTitle}>Comunicados</Text>
              <Text style={styles.menuItemDescription}>Em breve</Text>
            </View>
          </View>

          <View style={[styles.menuItem, styles.menuItemDisabled]}>
            <View style={styles.menuIcon}>
              <CalendarDays size={24} color={colors.secondary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuItemTitle}>Reservas</Text>
              <Text style={styles.menuItemDescription}>Em breve</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: colors.light,
    backgroundColor: '#fae3cf',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  greeting: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    fontFamily: 'Grift',
  },
  userName: {
    fontSize: fontSize.xl,
    color: colors.primary,
    fontFamily: 'GriftBold',
  },
  logoutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.error.main,
  },
  logoutText: {
    color: colors.error.main,
    fontFamily: 'GriftBold',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  welcomeCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  welcomeTitle: {
    fontSize: fontSize.xl,
    color: colors.primary,
    marginBottom: spacing.sm,
    fontFamily: 'GriftBold',
  },
  welcomeText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    lineHeight: 20,
    fontFamily: 'Grift',
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  infoTitle: {
    fontSize: fontSize.lg,
    color: colors.primary,
    marginBottom: spacing.md,
    fontFamily: 'GriftBold',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    width: 120,
    fontFamily: 'GriftBold',
  },
  infoValue: {
    fontSize: fontSize.sm,
    color: colors.primary,
    flex: 1,
    fontFamily: 'Grift',
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  menuTitle: {
    fontSize: fontSize.lg,
    color: colors.primary,
    marginBottom: spacing.md,
    fontFamily: 'GriftBold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuIconText: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: fontSize.base,
    color: colors.primary,
    marginBottom: spacing.xs / 2,
    fontFamily: 'GriftBold',
  },
  menuItemDescription: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
    fontFamily: 'Grift',
  },
  menuArrow: {
    fontSize: 32,
    color: colors.gray[400],
    marginLeft: spacing.sm,
  },
});
