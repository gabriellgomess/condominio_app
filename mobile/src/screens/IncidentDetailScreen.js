import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../utils/theme';
import { incidentService } from '../services/incidentService';

export default function IncidentDetailScreen({ navigation, route }) {
  const { incident } = route.params;
  const insets = useSafeAreaInsets();

  const types = incidentService.getTypes();
  const statuses = incidentService.getStatuses();
  const priorities = incidentService.getPriorities();

  const getStatusColor = (status) => {
    return colors.incidentStatus[status] || { bg: colors.gray[100], text: colors.gray[900] };
  };

  const getPriorityColor = (priority) => {
    return colors.priority[priority] || { bg: colors.gray[100], text: colors.gray[900] };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColor = getStatusColor(incident.status);
  const priorityColor = getPriorityColor(incident.priority);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Título */}
        <View style={styles.section}>
          <Text style={styles.title}>{incident.title}</Text>
        </View>

        {/* Status e Prioridade */}
        <View style={styles.tagsContainer}>
          <View style={[styles.tag, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.tagText, { color: statusColor.text }]}>
              {statuses[incident.status]}
            </Text>
          </View>
          <View style={[styles.tag, { backgroundColor: priorityColor.bg }]}>
            <Text style={[styles.tagText, { color: priorityColor.text }]}>
              {priorities[incident.priority]}
            </Text>
          </View>
        </View>

        {/* Informações */}
        <View style={[styles.card, shadows.sm]}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo:</Text>
            <Text style={styles.infoValue}>{types[incident.type]}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Local:</Text>
            <Text style={styles.infoValue}>{incident.location}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data:</Text>
            <Text style={styles.infoValue}>{formatDate(incident.incident_date)}</Text>
          </View>

          {incident.condominium && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Condomínio:</Text>
              <Text style={styles.infoValue}>{incident.condominium.name}</Text>
            </View>
          )}

          {incident.unit && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Unidade:</Text>
              <Text style={styles.infoValue}>
                {incident.block?.name ? `${incident.block.name} - ` : ''}
                {incident.unit.number}
              </Text>
            </View>
          )}

          {incident.resident && !incident.is_anonymous && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Morador:</Text>
              <Text style={styles.infoValue}>{incident.resident.owner_name}</Text>
            </View>
          )}

          {incident.is_anonymous && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Morador:</Text>
              <Text style={[styles.infoValue, { fontStyle: 'italic', color: colors.gray[500] }]}>
                Anônimo
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registrado em:</Text>
            <Text style={styles.infoValue}>{formatDate(incident.created_at)}</Text>
          </View>
        </View>

        {/* Descrição */}
        <View style={[styles.card, shadows.sm]}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{incident.description}</Text>
        </View>

        {/* Fotos */}
        {incident.photos_urls && Array.isArray(incident.photos_urls) && incident.photos_urls.length > 0 && (
          <View style={[styles.card, shadows.sm]}>
            <Text style={styles.sectionTitle}>Fotos ({incident.photos_urls.length})</Text>
            <View style={styles.photosGrid}>
              {incident.photos_urls.map((photoUrl, index) => (
                <Image
                  key={index}
                  source={{ uri: photoUrl }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ))}
            </View>
          </View>
        )}

        {/* Observações (se houver) */}
        {incident.notes && (
          <View style={[styles.card, shadows.sm]}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.description}>{incident.notes}</Text>
          </View>
        )}
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
  backButton: {
    padding: spacing.xs,
  },
  backButtonText: {
    fontSize: fontSize.base,
    color: colors.secondary,
    fontFamily: 'GriftBold',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    color: colors.primary,
    fontFamily: 'GriftBold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize['2xl'],
    color: colors.primary,
    lineHeight: 32,
    fontFamily: 'GriftBold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: fontSize.sm,
    fontFamily: 'GriftBold',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
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
    fontSize: fontSize.base,
    color: colors.gray[600],
    fontFamily: 'GriftBold',
    width: 100,
  },
  infoValue: {
    fontSize: fontSize.base,
    color: colors.primary,
    flex: 1,
    fontFamily: 'Grift',
  },
  description: {
    fontSize: fontSize.base,
    color: colors.gray[700],
    lineHeight: 24,
    fontFamily: 'Grift',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photo: {
    width: '48%',
    height: 150,
    borderRadius: borderRadius.md,
  },
});
