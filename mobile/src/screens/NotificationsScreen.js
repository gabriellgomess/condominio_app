import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Bell, AlertTriangle, Info, Megaphone, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import announcementService from '../services/announcementService';
import { colors, spacing, borderRadius, fontSize, shadows } from '../utils/theme';

// Cores por prioridade
const priorityColors = {
  urgent: { bg: colors.error.light, border: colors.error.main, icon: colors.error.main },
  high: { bg: '#FED7AA', border: '#F97316', icon: '#F97316' },
  normal: { bg: colors.secondary + '20', border: colors.secondary, icon: colors.secondary },
  low: { bg: colors.gray[100], border: colors.gray[300], icon: colors.gray[500] },
};

// Ícones por prioridade
const PriorityIcon = ({ priority, size = 20 }) => {
  const color = priorityColors[priority]?.icon || colors.secondary;
  
  switch (priority) {
    case 'urgent':
      return <AlertTriangle size={size} color={color} />;
    case 'high':
      return <Megaphone size={size} color={color} />;
    default:
      return <Info size={size} color={color} />;
  }
};

export default function NotificationsScreen() {
  const { user, resident } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Obter condominium_id do usuário ou resident
  const condominiumId = resident?.condominium_id || user?.condominium_id;

  const loadNotifications = useCallback(async () => {
    if (!condominiumId) {
      setLoading(false);
      return;
    }

    try {
      const response = await announcementService.getAnnouncements(condominiumId);
      
      if (response.success) {
        // Ordenar por prioridade e data
        const sorted = (response.data || []).sort((a, b) => {
          const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setNotifications(sorted);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [condominiumId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isNew = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const handleNotificationPress = (notification) => {
    setSelectedNotification(
      selectedNotification?.id === notification.id ? null : notification
    );
  };

  const renderNotification = ({ item }) => {
    const priority = item.priority || 'normal';
    const priorityStyle = priorityColors[priority] || priorityColors.normal;
    const isExpanded = selectedNotification?.id === item.id;
    const showNewBadge = isNew(item.published_at || item.created_at);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { borderColor: priorityStyle.border },
          isExpanded && styles.cardExpanded,
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: priorityStyle.bg }]}>
            <PriorityIcon priority={priority} />
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle} numberOfLines={isExpanded ? undefined : 1}>
                {item.title}
              </Text>
              {showNewBadge && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>Novo</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.cardDate}>
              {formatDate(item.published_at || item.created_at)}
            </Text>
          </View>

          <ChevronRight
            size={20}
            color={colors.gray[400]}
            style={[styles.chevron, isExpanded && styles.chevronExpanded]}
          />
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.cardDescription}>{item.content}</Text>
            
            {item.priority === 'urgent' && (
              <View style={styles.urgentBanner}>
                <AlertTriangle size={16} color={colors.error.main} />
                <Text style={styles.urgentText}>Comunicado urgente</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Bell size={64} color={colors.gray[300]} />
      </View>
      <Text style={styles.emptyTitle}>Tudo em dia!</Text>
      <Text style={styles.emptyText}>
        Você não tem notificações no momento. Quando houver novidades, elas aparecerão aqui.
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onRefresh}>
        <Text style={styles.emptyButtonText}>Atualizar</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={styles.loadingText}>Carregando notificações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.secondary]}
            tintColor={colors.secondary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: colors.gray[500],
    fontFamily: 'Grift',
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.secondary,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardExpanded: {
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontFamily: 'GriftBold',
    flex: 1,
  },
  newBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  newBadgeText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontFamily: 'GriftBold',
  },
  cardDate: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    fontFamily: 'Grift',
    marginTop: 2,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  chevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  expandedContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  cardDescription: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    fontFamily: 'Grift',
    lineHeight: 22,
  },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error.light,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  urgentText: {
    fontSize: fontSize.sm,
    color: colors.error.main,
    fontFamily: 'GriftBold',
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    color: colors.primary,
    fontFamily: 'GriftBold',
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    fontFamily: 'Grift',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  emptyButtonText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontFamily: 'GriftBold',
  },
});
