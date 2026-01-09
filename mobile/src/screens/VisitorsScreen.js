import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import {
  Users,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Car,
  Phone,
  ArrowLeft,
  Settings,
  LogOut,
  Filter,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import visitorService from '../services/visitorService';
import { colors, spacing, borderRadius, fontSize, shadows } from '../utils/theme';
import BottomNavigation from '../components/BottomNavigation';
import SettingsMenu from '../components/SettingsMenu';
import VisitorModal from '../components/modals/VisitorModal';

// Configuração de status dos visitantes
const statusConfig = {
  pending: {
    label: 'Aguardando',
    color: colors.warning.main,
    bg: colors.warning.light,
    icon: AlertTriangle,
  },
  scheduled: {
    label: 'Agendado',
    color: colors.success.main,
    bg: colors.success.light,
    icon: CheckCircle,
  },
  checked_in: {
    label: 'No Condomínio',
    color: colors.primary,
    bg: colors.gray[100],
    icon: CheckCircle,
  },
  checked_out: {
    label: 'Saiu',
    color: colors.gray[500],
    bg: colors.gray[100],
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelado',
    color: colors.error.main,
    bg: colors.error.light,
    icon: XCircle,
  },
  rejected: {
    label: 'Rejeitado',
    color: colors.error.main,
    bg: colors.error.light,
    icon: XCircle,
  },
};

// Tipos de visitante
const visitorTypes = {
  personal: 'Visitante',
  service: 'Prestador de Serviço',
  delivery: 'Entregador',
  taxi: 'Taxi/App',
  other: 'Outro',
};

export default function VisitorsScreen({ navigation }) {
  const { user, resident, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // all, pending, scheduled, checked_in

  const condominiumId = resident?.condominium_id || user?.condominium_id;

  useEffect(() => {
    loadVisitors();
  }, [activeFilter]);

  const loadVisitors = useCallback(async () => {
    if (!condominiumId) return;

    try {
      const filters = {};
      if (activeFilter !== 'all') {
        filters.status = activeFilter;
      }

      const response = await visitorService.getVisitors(condominiumId, filters);

      if (response.success) {
        setVisitors(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar visitantes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [condominiumId, activeFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadVisitors();
  };

  const handleDelete = (visitorId, visitorName) => {
    Alert.alert(
      'Excluir Visitante',
      `Deseja realmente excluir o visitante ${visitorName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const response = await visitorService.deleteVisitor(visitorId);
            if (response.success) {
              Alert.alert('Sucesso', 'Visitante excluído com sucesso');
              loadVisitors();
            } else {
              Alert.alert('Erro', response.error || 'Erro ao excluir visitante');
            }
          },
        },
      ]
    );
  };

  const handleOpenModal = (visitor = null) => {
    setSelectedVisitor(visitor);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedVisitor(null);
  };

  const handleModalSuccess = () => {
    handleCloseModal();
    loadVisitors();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sem data';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    }
    return timeString;
  };

  const renderVisitorCard = ({ item }) => {
    const status = statusConfig[item.status] || statusConfig.pending;
    const StatusIcon = status.icon;
    const visitorType = visitorTypes[item.visitor_type] || 'Visitante';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleOpenModal(item)}
        activeOpacity={0.7}
      >
        {/* Header do Card */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <User size={24} color={colors.secondary} />
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{visitorType}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <StatusIcon size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* Informações */}
        <View style={styles.cardBody}>
          {item.scheduled_date && (
            <View style={styles.infoRow}>
              <Calendar size={16} color={colors.gray[600]} />
              <Text style={styles.infoText}>
                {formatDate(item.scheduled_date)}
                {item.scheduled_time && ` às ${formatTime(item.scheduled_time)}`}
              </Text>
            </View>
          )}

          {item.phone && (
            <View style={styles.infoRow}>
              <Phone size={16} color={colors.gray[600]} />
              <Text style={styles.infoText}>{item.phone}</Text>
            </View>
          )}

          {item.vehicle_plate && (
            <View style={styles.infoRow}>
              <Car size={16} color={colors.gray[600]} />
              <Text style={styles.infoText}>
                {item.vehicle_plate}
                {item.vehicle_model && ` - ${item.vehicle_model}`}
              </Text>
            </View>
          )}

          {item.purpose && (
            <Text style={styles.purposeText} numberOfLines={2}>
              {item.purpose}
            </Text>
          )}
        </View>

        {/* Ações */}
        {item.status === 'pending' && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item.id, item.name)}
            >
              <XCircle size={16} color={colors.white} />
              <Text style={styles.actionButtonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Users size={64} color={colors.gray[300]} />
      </View>
      <Text style={styles.emptyTitle}>Nenhum visitante</Text>
      <Text style={styles.emptyText}>
        {activeFilter === 'all'
          ? 'Você ainda não cadastrou nenhum visitante'
          : 'Não há visitantes com este status'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={styles.loadingText}>Carregando visitantes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerTitleContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visitantes</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setSettingsVisible(true)}>
            <Settings size={24} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={logout}>
            <LogOut size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'pending' && styles.filterChipActive]}
          onPress={() => setActiveFilter('pending')}
        >
          <Text style={[styles.filterChipText, activeFilter === 'pending' && styles.filterChipTextActive]}>
            Aguardando
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'scheduled' && styles.filterChipActive]}
          onPress={() => setActiveFilter('scheduled')}
        >
          <Text style={[styles.filterChipText, activeFilter === 'scheduled' && styles.filterChipTextActive]}>
            Agendados
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'checked_in' && styles.filterChipActive]}
          onPress={() => setActiveFilter('checked_in')}
        >
          <Text style={[styles.filterChipText, activeFilter === 'checked_in' && styles.filterChipTextActive]}>
            No Condomínio
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Visitantes */}
      <FlatList
        data={visitors}
        renderItem={renderVisitorCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.secondary]}
          />
        }
      />

      {/* FAB - Novo Visitante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => handleOpenModal()}
      >
        <Plus size={28} color={colors.white} />
      </TouchableOpacity>

      {/* Modal de Cadastro/Edição */}
      <VisitorModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        visitor={selectedVisitor}
        condominiumId={condominiumId}
        unitId={resident?.unit_id}
      />

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab="home"
        onTabPress={(tab) => {
          if (tab === 'home') {
            navigation.goBack();
          }
        }}
      />

      {/* Settings Menu */}
      <SettingsMenu
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        user={user}
        onNavigate={(key) => {
          setSettingsVisible(false);
        }}
      />
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
    paddingBottom: spacing.md,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    color: colors.white,
    fontFamily: 'GriftBold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.xs,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  filterChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    fontFamily: 'Grift',
  },
  filterChipTextActive: {
    color: colors.white,
    fontFamily: 'GriftBold',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardHeaderText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontFamily: 'GriftBold',
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    fontFamily: 'Grift',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontFamily: 'GriftBold',
  },
  cardBody: {
    gap: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    fontFamily: 'Grift',
  },
  purposeText: {
    fontSize: fontSize.sm,
    color: colors.gray[700],
    fontFamily: 'Grift',
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  deleteButton: {
    backgroundColor: colors.error.main,
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontFamily: 'GriftBold',
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
    fontSize: fontSize.base,
    color: colors.gray[500],
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
