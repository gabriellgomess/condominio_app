import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { incidentService } from '../services/incidentService';
import { MapPin, ClipboardList, Plus } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../utils/theme';

export default function IncidentsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
  });

  // Recarregar quando a tela ficar em foco
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadIncidents(), loadStats()]);
    setLoading(false);
  };

  const loadIncidents = async () => {
    const result = await incidentService.getMyIncidents();
    if (result.success) {
      setIncidents(result.data.data.data || []);
    }
  };

  const loadStats = async () => {
    const result = await incidentService.getMyStats();
    if (result.success) {
      setStats(result.data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    return colors.incidentStatus[status] || { bg: colors.gray[100], text: colors.gray[900] };
  };

  const getPriorityColor = (priority) => {
    return colors.priority[priority] || { bg: colors.gray[100], text: colors.gray[900] };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Há alguns minutos';
    if (diffInHours < 24) return `Há ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Há ${diffInDays}d`;

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const renderStatCard = (title, value, color) => (
    <View style={[styles.statCard, shadows.md]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  );

  const renderIncidentItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const priorityColor = getPriorityColor(item.priority);
    const types = incidentService.getTypes();
    const statuses = incidentService.getStatuses();
    const priorities = incidentService.getPriorities();

    return (
      <TouchableOpacity
        style={[styles.incidentCard, shadows.sm]}
        onPress={() => navigation.navigate('IncidentDetail', { incident: item })}
      >
        <View style={styles.incidentHeader}>
          <Text style={styles.incidentTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.incidentDate}>{formatDate(item.incident_date)}</Text>
        </View>

        <Text style={styles.incidentDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.incidentTags}>
          <View style={[styles.tag, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.tagText, { color: statusColor.text }]}>
              {statuses[item.status]}
            </Text>
          </View>
          <View style={[styles.tag, { backgroundColor: priorityColor.bg }]}>
            <Text style={[styles.tagText, { color: priorityColor.text }]}>
              {priorities[item.priority]}
            </Text>
          </View>
        </View>

        <View style={styles.incidentFooter}>
          <Text style={styles.incidentType}>{types[item.type]}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
            <MapPin size={16} color={colors.gray[600]} />
            <Text style={[styles.incidentLocation, { marginLeft: 4 }]} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Ocorrências</Text>
          <Text style={styles.headerSubtitle}>Acompanhe e registre ocorrências</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {renderStatCard('Total', stats.total, colors.secondary)}
        {renderStatCard('Abertas', stats.open, colors.error.main)}
        {renderStatCard('Andamento', stats.in_progress, colors.warning.main)}
        {renderStatCard('Resolvidas', stats.resolved, colors.success.main)}
      </View>

      {/* List */}
      <FlatList
        data={incidents}
        renderItem={renderIncidentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ClipboardList color={colors.gray[400]} size={64} style={{ marginBottom: spacing.md }} />
            <Text style={styles.emptyText}>Nenhuma ocorrência encontrada</Text>
            <Text style={styles.emptySubtext}>As ocorrências registradas aparecerão aqui</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, shadows.lg, { bottom: spacing.md + insets.bottom }]}
        onPress={() => navigation.navigate('NewIncident')}
      >
        <Plus color={colors.white} size={28} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: colors.light,
    backgroundColor: '#fae3cf',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: fontSize['2xl'],
    color: colors.primary,
    fontFamily: 'GriftBold',
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginTop: spacing.xs,
    fontFamily: 'Grift',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize['2xl'],
    color: colors.primary,
    fontFamily: 'GriftBold',
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
    marginTop: spacing.xs,
    fontFamily: 'Grift',
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  incidentCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  incidentTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.primary,
    fontFamily: 'GriftBold',
  },
  incidentDate: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginLeft: spacing.sm,
    fontFamily: 'Grift',
  },
  incidentDescription: {
    fontSize: fontSize.sm,
    color: colors.gray[700],
    marginBottom: spacing.md,
    lineHeight: 20,
    fontFamily: 'Grift',
  },
  incidentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontFamily: 'GriftBold',
  },
  incidentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.sm,
  },
  incidentType: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
    fontFamily: 'GriftBold',
  },
  incidentLocation: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
    flex: 1,
    textAlign: 'right',
    fontFamily: 'Grift',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.gray[700],
    marginBottom: spacing.xs,
    fontFamily: 'GriftBold',
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    fontFamily: 'Grift',
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: colors.white,
    fontFamily: 'GriftBold',
  },
});
