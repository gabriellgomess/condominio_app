import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const logoFull = require('../../assets/logo_full.png');
import {
  Bell,
  Users,
  Calendar,
  Megaphone,
  UserPlus,
  CalendarDays,
  Building2,
  FileText,
  BookOpen,
  Settings,
  MessageCircle,
  LogOut,
} from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../utils/theme';
import BottomNavigation from '../components/BottomNavigation';

// Dados do menu de funcionalidades
const menuItems = [
  { key: 'notifications', label: 'Notificações', icon: Bell, badge: 3 },
  { key: 'visitors', label: 'Visitantes', icon: Users, badge: 4 },
  { key: 'events', label: 'Eventos', icon: Calendar, badge: 2 },
  { key: 'announcements', label: 'Comunicados', icon: Megaphone },
  { key: 'registerVisitors', label: 'Cadastro de Visitantes', icon: UserPlus },
  { key: 'calendar', label: 'Calendário de Eventos', icon: CalendarDays },
  { key: 'services', label: 'Serviços do Condomínio', icon: Building2 },
  { key: 'contracts', label: 'Contratos', icon: FileText },
  { key: 'rules', label: 'Padrões do Condomínio', icon: BookOpen },
];

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('home');

  const handleMenuPress = (key) => {
    // Navegação para as telas
    switch (key) {
      case 'notifications':
        // navigation.navigate('Notifications');
        break;
      case 'announcements':
        // navigation.navigate('Announcements');
        break;
      default:
        break;
    }
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    // Navegação entre tabs
  };

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.key}
      style={styles.menuItem}
      onPress={() => handleMenuPress(item.key)}
      activeOpacity={0.7}      
    >
      <View style={styles.menuIconContainer}>
        <item.icon size={32} color={colors.secondary} />
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.menuLabel} numberOfLines={2}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Image source={logoFull} style={styles.headerLogo} resizeMode="contain" />
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Settings size={24} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={logout}>
            <LogOut size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Conteúdo */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card de Boas-vindas */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeGreeting}>
            Olá, <Text style={styles.welcomeName}>{user?.name || 'Morador'}</Text>!
          </Text>
          <Text style={styles.welcomeCondominium}>
            {user?.condominium_name || 'Condomínio Residencial Jardim das Flores'}
          </Text>
        </View>

        {/* Grid de Funcionalidades */}
        <View style={styles.menuGrid}>
          {menuItems.map(renderMenuItem)}
        </View>
      </ScrollView>

      {/* FAB - Botão de Chat */}
      <TouchableOpacity style={styles.fab}>
        <MessageCircle size={28} color={colors.white} />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerLogo: {
    width: 140,
    height: 35,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.xs,
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
    borderWidth: 1,
    borderColor: colors.secondary,
    ...shadows.sm,
  },
  welcomeGreeting: {
    fontSize: fontSize.xl,
    color: colors.primary,
    fontFamily: 'Grift',
  },
  welcomeName: {
    color: colors.secondary,
    fontFamily: 'GriftBold',
  },
  welcomeCondominium: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    fontFamily: 'Grift',
    marginTop: spacing.xs,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '31%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondary,
    ...shadows.sm,
  },
  menuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontFamily: 'GriftBold',
  },
  menuLabel: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontFamily: 'Grift',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: 135,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
});
