import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../utils/theme';

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

export default function HomeContent({ navigation }) {
  const { user } = useAuth();

  const handleMenuPress = (key) => {
    switch (key) {
      case 'events':
      case 'calendar':
        navigation.navigate('Events');
        break;
      case 'notifications':
        // As notificações estão na aba de notificações do MainTabScreen
        break;
      case 'announcements':
        // Os comunicados estão na aba de notificações do MainTabScreen
        break;
      default:
        break;
    }
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
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
    borderWidth: 0.8,
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
    borderWidth: 0.8,
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
});
