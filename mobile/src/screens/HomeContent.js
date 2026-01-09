import React, { useState, useEffect, useCallback } from 'react';
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
  CheckSquare,
} from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../utils/theme';
import reservationService from '../services/reservationService';
import announcementService from '../services/announcementService';
import api from '../services/api';

export default function HomeContent({ navigation }) {
  const { user, resident } = useAuth();
  const [counts, setCounts] = useState({
    notifications: 0,
    visitors: 0,
    events: 0,
  });

  const condominiumId = resident?.condominium_id || user?.condominium_id;

  const loadCounts = useCallback(async () => {
    if (!condominiumId) return;

    try {
      // Buscar contagens em paralelo
      const [reservationsRes, announcementsRes, visitorsRes] = await Promise.all([
        // Reservas/Eventos - contar apenas futuras
        reservationService.getReservations(condominiumId).catch(() => ({ success: false, data: [] })),

        // Anúncios não lidos (notificações)
        announcementService.getAnnouncements(condominiumId).catch(() => ({ success: false, data: [] })),

        // Visitantes pendentes/agendados
        api.get(`/condominiums/${condominiumId}/visitors`).catch(() => ({ data: { data: [] } })),
      ]);

      const newCounts = {
        notifications: 0,
        visitors: 0,
        events: 0,
      };

      // Contar eventos futuros
      if (reservationsRes.success && Array.isArray(reservationsRes.data)) {
        const now = new Date();
        newCounts.events = reservationsRes.data.filter(r => {
          const reservationDate = new Date(r.reservation_date);
          return reservationDate >= now && r.status !== 'cancelled';
        }).length;
      }

      // Contar anúncios não lidos (últimos 7 dias como "novo")
      if (announcementsRes.success && Array.isArray(announcementsRes.data)) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        newCounts.notifications = announcementsRes.data.filter(a => {
          const announcementDate = new Date(a.created_at);
          return announcementDate >= sevenDaysAgo;
        }).length;
      }

      // Contar visitantes pendentes/agendados
      if (visitorsRes.data?.data && Array.isArray(visitorsRes.data.data)) {
        newCounts.visitors = visitorsRes.data.data.filter(v =>
          v.status === 'pending' || v.status === 'scheduled'
        ).length;
      }

      setCounts(newCounts);
    } catch (error) {
      console.error('Erro ao carregar contagens:', error);
    }
  }, [condominiumId]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const handleMenuPress = (key) => {
    switch (key) {
      case 'events':
      case 'calendar':
        navigation.navigate('Events');
        break;
      case 'visitors':
      case 'registerVisitors':
        navigation.navigate('Visitors');
        break;
      case 'validateVisitors':
        navigation.navigate('VisitorValidation');
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

  // Verificar se o usuário tem permissão de administrador ou síndico
  const hasAdminAccess = user?.access_level === 'sindico' || user?.access_level === 'administrador';

  // Dados do menu de funcionalidades com badges dinâmicos
  const menuItems = [
    { key: 'notifications', label: 'Notificações', icon: Bell, badge: counts.notifications },
    { key: 'visitors', label: 'Visitantes', icon: Users, badge: counts.visitors },
    { key: 'events', label: 'Eventos', icon: Calendar, badge: counts.events },
    { key: 'announcements', label: 'Comunicados', icon: Megaphone },
    { key: 'registerVisitors', label: 'Cadastro de Visitantes', icon: UserPlus },
    ...(hasAdminAccess ? [{ key: 'validateVisitors', label: 'Validar Visitantes', icon: CheckSquare, badge: counts.visitors }] : []),
    { key: 'calendar', label: 'Calendário de Eventos', icon: CalendarDays },
    { key: 'services', label: 'Serviços do Condomínio', icon: Building2 },
    { key: 'contracts', label: 'Contratos', icon: FileText },
    { key: 'rules', label: 'Padrões do Condomínio', icon: BookOpen },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.key}
      style={styles.menuItem}
      onPress={() => handleMenuPress(item.key)}
      activeOpacity={0.7}
    >
      {item.badge !== undefined && item.badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      )}
      <View style={styles.menuIconContainer}>
        <item.icon size={32} color={colors.secondary} />
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
    position: 'relative',
    ...shadows.sm,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    minWidth: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.md,
  },
  badgeText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontFamily: 'GriftBold',
  },
  menuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  menuLabel: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontFamily: 'Grift',
    textAlign: 'center',
  },
});
