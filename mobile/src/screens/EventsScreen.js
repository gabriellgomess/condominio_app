import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  X,
  Plus,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  DollarSign,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import reservationService from '../services/reservationService';
import { colors, spacing, borderRadius, fontSize, shadows } from '../utils/theme';

// Status das reservas
const statusConfig = {
  pending: { label: 'Pendente', color: colors.warning.main, bg: colors.warning.light },
  confirmed: { label: 'Confirmada', color: colors.success.main, bg: colors.success.light },
  cancelled: { label: 'Cancelada', color: colors.error.main, bg: colors.error.light },
  completed: { label: 'Concluída', color: colors.gray[500], bg: colors.gray[100] },
};

export default function EventsScreen({ navigation }) {
  const { user, resident } = useAuth();
  const insets = useSafeAreaInsets();
  const [reservations, setReservations] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [formData, setFormData] = useState({
    reservation_date: '',
    start_time: '',
    end_time: '',
    contact_name: user?.name || '',
    contact_phone: '',
    contact_email: user?.email || '',
    event_type: '',
    event_description: '',
    expected_guests: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  const condominiumId = resident?.condominium_id || user?.condominium_id;

  const loadData = useCallback(async () => {
    console.log('📅 EventsScreen - condominiumId:', condominiumId);
    console.log('📅 EventsScreen - user:', user);
    console.log('📅 EventsScreen - resident:', resident);

    if (!condominiumId) {
      console.log('⚠️ EventsScreen - Sem condominium_id!');
      setLoading(false);
      return;
    }

    try {
      console.log('📅 Buscando espaços reserváveis para condomínio:', condominiumId);
      const [reservationsRes, spacesRes] = await Promise.all([
        reservationService.getReservations(condominiumId),
        reservationService.getReservableSpaces(condominiumId),
      ]);

      console.log('📅 Reservas response:', reservationsRes);
      console.log('📅 Espaços response:', spacesRes);

      if (reservationsRes.success) {
        setReservations(reservationsRes.data);
      }

      if (spacesRes.success) {
        console.log('📅 Espaços encontrados:', spacesRes.data?.length || 0);
        setSpaces(spacesRes.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [condominiumId, user, resident]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Verificar disponibilidade quando espaço ou data mudar
  useEffect(() => {
    if (selectedSpace && formData.reservation_date) {
      checkAvailability();
    }
  }, [selectedSpace, formData.reservation_date]);

  const checkAvailability = async () => {
    if (!selectedSpace || !formData.reservation_date) return;

    setCheckingAvailability(true);
    setAvailability(null);
    setConflicts([]);

    try {
      const spaceId = selectedSpace.space_id || selectedSpace.id;
      const result = await reservationService.checkAvailability(spaceId, formData.reservation_date);

      if (result.success && result.data) {
        setAvailability(result.data);

        // Se não disponível, limpar horários
        if (!result.data.available) {
          setFormData(prev => ({
            ...prev,
            start_time: '',
            end_time: '',
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      setAvailability(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
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

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const formatCurrency = (value) => {
    if (!value) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateEstimatedCost = () => {
    if (!availability?.config || !formData.start_time || !formData.end_time) return null;

    const [startHour, startMin] = formData.start_time.split(':').map(Number);
    const [endHour, endMin] = formData.end_time.split(':').map(Number);
    const durationHours = (endHour + endMin / 60) - (startHour + startMin / 60);

    if (availability.config.hourly_rate) {
      return availability.config.hourly_rate * durationHours;
    } else if (availability.config.daily_rate && durationHours >= 8) {
      return availability.config.daily_rate;
    }

    return 0;
  };

  const getFilteredReservations = () => {
    const now = new Date();

    if (activeTab === 'my') {
      return reservations.filter((r) => r.user_id === user?.id);
    }

    return reservations.filter((r) => {
      const reservationDate = new Date(r.reservation_date);
      return reservationDate >= now && r.status !== 'cancelled';
    });
  };

  const handleOpenModal = () => {
    setSelectedSpace(null);
    setAvailability(null);
    setConflicts([]);
    setFormData({
      reservation_date: '',
      start_time: '',
      end_time: '',
      contact_name: user?.name || '',
      contact_phone: '',
      contact_email: user?.email || '',
      event_type: '',
      event_description: '',
      expected_guests: '',
    });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedSpace(null);
    setAvailability(null);
    setConflicts([]);
  };

  const handleSelectSpace = (space) => {
    setSelectedSpace(space);
    setAvailability(null);
    setFormData(prev => ({
      ...prev,
      start_time: '',
      end_time: '',
    }));
  };

  const handleSubmit = async () => {
    if (!selectedSpace) {
      Alert.alert('Erro', 'Selecione um espaço para reservar');
      return;
    }

    if (!formData.reservation_date) {
      Alert.alert('Erro', 'Selecione a data da reserva');
      return;
    }

    if (!availability?.available) {
      Alert.alert('Erro', 'O espaço não está disponível nesta data');
      return;
    }

    if (!formData.start_time || !formData.end_time) {
      Alert.alert('Erro', 'Preencha os horários de início e término');
      return;
    }

    if (!formData.contact_name || !formData.contact_phone) {
      Alert.alert('Erro', 'Preencha o nome e telefone de contato');
      return;
    }

    // Validar horários dentro do permitido
    if (availability.config) {
      const configStart = availability.config.start_time;
      const configEnd = availability.config.end_time;

      if (formData.start_time < configStart || formData.end_time > configEnd) {
        Alert.alert('Erro', `O horário deve estar entre ${configStart} e ${configEnd}`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const spaceId = selectedSpace.space_id || selectedSpace.id;
      const reservationData = {
        space_id: spaceId,
        condominium_id: condominiumId,
        unit_id: resident?.unit_id,
        ...formData,
        expected_guests: parseInt(formData.expected_guests) || 0,
      };

      const result = await reservationService.createReservation(reservationData);

      if (result.success) {
        Alert.alert('Sucesso', result.message || 'Reserva criada com sucesso!');
        handleCloseModal();
        loadData();
      } else {
        // Verificar se é erro de conflito
        if (result.conflicts) {
          setConflicts(result.conflicts);
        }
        Alert.alert('Erro', result.error || 'Erro ao criar reserva');
      }
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      Alert.alert('Erro', 'Erro ao processar reserva');
    } finally {
      setSubmitting(false);
    }
  };

  const renderReservation = ({ item }) => {
    const status = statusConfig[item.status] || statusConfig.pending;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.space?.name || 'Espaço'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Calendar size={16} color={colors.secondary} />
            <Text style={styles.detailText}>{formatDate(item.reservation_date)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Clock size={16} color={colors.secondary} />
            <Text style={styles.detailText}>
              {formatTime(item.start_time)} - {formatTime(item.end_time)}
            </Text>
          </View>

          {item.event_type && (
            <View style={styles.detailRow}>
              <MapPin size={16} color={colors.secondary} />
              <Text style={styles.detailText}>{item.event_type}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <User size={16} color={colors.secondary} />
            <Text style={styles.detailText}>{item.contact_name}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Calendar size={64} color={colors.gray[300]} />
      </View>
      <Text style={styles.emptyTitle}>
        {!condominiumId 
          ? 'Sem condomínio' 
          : spaces.length === 0 
          ? 'Sem espaços disponíveis' 
          : 'Nenhum evento'}
      </Text>
      <Text style={styles.emptyText}>
        {!condominiumId
          ? 'Seu usuário não está vinculado a um condomínio.'
          : spaces.length === 0
          ? 'Não há espaços configurados para reserva neste condomínio.'
          : activeTab === 'my'
          ? 'Você ainda não fez nenhuma reserva.'
          : 'Não há eventos agendados no momento.'}
      </Text>
      {spaces.length > 0 && (
        <TouchableOpacity style={styles.emptyButton} onPress={handleOpenModal}>
          <Text style={styles.emptyButtonText}>Fazer Reserva</Text>
        </TouchableOpacity>
      )}
      {spaces.length === 0 && condominiumId && (
        <TouchableOpacity style={styles.emptyButton} onPress={onRefresh}>
          <Text style={styles.emptyButtonText}>Atualizar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={styles.loadingText}>Carregando eventos...</Text>
      </View>
    );
  }

  const filteredReservations = getFilteredReservations();
  const estimatedCost = calculateEstimatedCost();

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Próximos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && styles.tabActive]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
            Minhas Reservas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={filteredReservations}
        renderItem={renderReservation}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.secondary]}
          />
        }
      />

      {/* FAB */}
      {spaces.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleOpenModal}>
          <Plus size={28} color={colors.white} />
        </TouchableOpacity>
      )}

      {/* Modal de Nova Reserva */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Reserva</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <X size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Seleção de Espaço */}
              <Text style={styles.inputLabel}>Espaço *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.spacesScroll}>
                {spaces.map((space) => {
                  const isSelected = selectedSpace?.id === space.id || selectedSpace?.space_id === space.space_id;
                  return (
                    <TouchableOpacity
                      key={space.id || space.space_id}
                      style={[styles.spaceCard, isSelected && styles.spaceCardSelected]}
                      onPress={() => handleSelectSpace(space)}
                    >
                      <Text style={[styles.spaceName, isSelected && styles.spaceNameSelected]}>
                        {space.space?.name || space.name}
                      </Text>
                      <Text style={[styles.spaceCapacity, isSelected && styles.spaceCapacitySelected]}>
                        Capacidade: {space.max_capacity || space.space?.capacity || '-'}
                      </Text>
                      {isSelected && (
                        <CheckCircle size={16} color={colors.white} style={styles.spaceCheck} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Data */}
              <Text style={styles.inputLabel}>Data da Reserva *</Text>
              <TextInput
                style={styles.input}
                placeholder="AAAA-MM-DD (ex: 2025-01-15)"
                placeholderTextColor={colors.gray[400]}
                value={formData.reservation_date}
                onChangeText={(text) => setFormData({ ...formData, reservation_date: text })}
              />

              {/* Verificação de Disponibilidade */}
              {checkingAvailability && (
                <View style={styles.availabilityChecking}>
                  <ActivityIndicator size="small" color={colors.info.main} />
                  <Text style={styles.availabilityCheckingText}>Verificando disponibilidade...</Text>
                </View>
              )}

              {availability && !availability.available && (
                <View style={styles.availabilityError}>
                  <AlertTriangle size={20} color={colors.error.main} />
                  <Text style={styles.availabilityErrorText}>
                    {availability.reason || 'Espaço não disponível nesta data'}
                  </Text>
                </View>
              )}

              {availability && availability.available && (
                <View style={styles.availabilitySuccess}>
                  <View style={styles.availabilityHeader}>
                    <CheckCircle size={20} color={colors.success.main} />
                    <Text style={styles.availabilitySuccessText}>Espaço disponível!</Text>
                  </View>

                  <View style={styles.availabilityInfo}>
                    <View style={styles.availabilityItem}>
                      <Clock size={14} color={colors.gray[500]} />
                      <Text style={styles.availabilityLabel}>Horário:</Text>
                      <Text style={styles.availabilityValue}>
                        {availability.config?.start_time} - {availability.config?.end_time}
                      </Text>
                    </View>

                    {availability.config?.duration_minutes && (
                      <View style={styles.availabilityItem}>
                        <Info size={14} color={colors.gray[500]} />
                        <Text style={styles.availabilityLabel}>Duração mín:</Text>
                        <Text style={styles.availabilityValue}>
                          {availability.config.duration_minutes} min
                        </Text>
                      </View>
                    )}

                    <View style={styles.availabilityItem}>
                      <DollarSign size={14} color={colors.gray[500]} />
                      <Text style={styles.availabilityLabel}>Taxa:</Text>
                      <Text style={styles.availabilityValue}>
                        {availability.config?.hourly_rate
                          ? `${formatCurrency(availability.config.hourly_rate)}/hora`
                          : availability.config?.daily_rate
                          ? `${formatCurrency(availability.config.daily_rate)}/dia`
                          : 'Gratuito'}
                      </Text>
                    </View>
                  </View>

                  {/* Reservas existentes */}
                  {availability.existing_reservations?.length > 0 && (
                    <View style={styles.existingReservations}>
                      <Text style={styles.existingTitle}>Reservas nesta data:</Text>
                      {availability.existing_reservations.map((existing, index) => (
                        <View key={index} style={styles.existingItem}>
                          <Text style={styles.existingTime}>
                            {formatTime(existing.start_time)} - {formatTime(existing.end_time)}
                          </Text>
                          <Text style={styles.existingName}>{existing.contact_name}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Horários (só mostrar se disponível) */}
              {availability?.available && (
                <>
                  <View style={styles.row}>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Início *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="HH:MM"
                        placeholderTextColor={colors.gray[400]}
                        value={formData.start_time}
                        onChangeText={(text) => setFormData({ ...formData, start_time: text })}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={styles.inputLabel}>Término *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="HH:MM"
                        placeholderTextColor={colors.gray[400]}
                        value={formData.end_time}
                        onChangeText={(text) => setFormData({ ...formData, end_time: text })}
                      />
                    </View>
                  </View>

                  {/* Custo estimado */}
                  {estimatedCost !== null && estimatedCost > 0 && (
                    <View style={styles.estimatedCost}>
                      <Text style={styles.estimatedCostLabel}>Custo estimado:</Text>
                      <Text style={styles.estimatedCostValue}>{formatCurrency(estimatedCost)}</Text>
                    </View>
                  )}

                  {/* Conflitos */}
                  {conflicts.length > 0 && (
                    <View style={styles.conflictsContainer}>
                      <View style={styles.conflictsHeader}>
                        <AlertTriangle size={20} color={colors.error.main} />
                        <Text style={styles.conflictsTitle}>Conflito de Horário!</Text>
                      </View>
                      {conflicts.map((conflict, index) => (
                        <View key={index} style={styles.conflictItem}>
                          <Text style={styles.conflictTime}>
                            {conflict.start_time} - {conflict.end_time}
                          </Text>
                          <Text style={styles.conflictName}>{conflict.contact_name}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Contato */}
                  <Text style={styles.inputLabel}>Nome do Responsável *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Seu nome"
                    placeholderTextColor={colors.gray[400]}
                    value={formData.contact_name}
                    onChangeText={(text) => setFormData({ ...formData, contact_name: text })}
                  />

                  <Text style={styles.inputLabel}>Telefone *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="(00) 00000-0000"
                    placeholderTextColor={colors.gray[400]}
                    value={formData.contact_phone}
                    onChangeText={(text) => setFormData({ ...formData, contact_phone: text })}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.inputLabel}>Tipo de Evento</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Aniversário, Reunião, Churrasco..."
                    placeholderTextColor={colors.gray[400]}
                    value={formData.event_type}
                    onChangeText={(text) => setFormData({ ...formData, event_type: text })}
                  />

                  <Text style={styles.inputLabel}>Número de Convidados</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Quantidade estimada"
                    placeholderTextColor={colors.gray[400]}
                    value={formData.expected_guests}
                    onChangeText={(text) => setFormData({ ...formData, expected_guests: text })}
                    keyboardType="numeric"
                  />

                  <Text style={styles.inputLabel}>Descrição</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Observações adicionais..."
                    placeholderTextColor={colors.gray[400]}
                    value={formData.event_description}
                    onChangeText={(text) => setFormData({ ...formData, event_description: text })}
                    multiline
                    numberOfLines={3}
                  />
                </>
              )}

              {/* Botão Enviar */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!availability?.available || submitting || conflicts.length > 0) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!availability?.available || submitting || conflicts.length > 0}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {conflicts.length > 0 ? 'Conflito Detectado' : 'Solicitar Reserva'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.xs,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: colors.secondary,
  },
  tabText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    fontFamily: 'Grift',
  },
  tabTextActive: {
    color: colors.white,
    fontFamily: 'GriftBold',
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
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
  cardInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontFamily: 'GriftBold',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontFamily: 'GriftBold',
  },
  cardDetails: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    fontFamily: 'Grift',
    marginLeft: spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    color: colors.primary,
    fontFamily: 'GriftBold',
  },
  inputLabel: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontFamily: 'GriftBold',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    fontFamily: 'Grift',
    color: colors.primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  spacesScroll: {
    marginVertical: spacing.sm,
  },
  spaceCard: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginRight: spacing.sm,
    minWidth: 160,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  spaceCardSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  spaceName: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontFamily: 'GriftBold',
  },
  spaceNameSelected: {
    color: colors.white,
  },
  spaceCapacity: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    fontFamily: 'Grift',
    marginTop: 2,
  },
  spaceCapacitySelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  spaceCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  availabilityChecking: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info.light,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  availabilityCheckingText: {
    fontSize: fontSize.sm,
    color: colors.info.main,
    fontFamily: 'Grift',
    marginLeft: spacing.sm,
  },
  availabilityError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error.light,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  availabilityErrorText: {
    fontSize: fontSize.sm,
    color: colors.error.main,
    fontFamily: 'Grift',
    marginLeft: spacing.sm,
    flex: 1,
  },
  availabilitySuccess: {
    backgroundColor: colors.success.light,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  availabilitySuccessText: {
    fontSize: fontSize.sm,
    color: colors.success.dark,
    fontFamily: 'GriftBold',
    marginLeft: spacing.sm,
  },
  availabilityInfo: {
    gap: spacing.xs,
  },
  availabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityLabel: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
    fontFamily: 'Grift',
    marginLeft: spacing.xs,
  },
  availabilityValue: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontFamily: 'GriftBold',
    marginLeft: spacing.xs,
  },
  existingReservations: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  existingTitle: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
    fontFamily: 'GriftBold',
    marginBottom: spacing.xs,
  },
  existingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: 4,
  },
  existingTime: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontFamily: 'GriftBold',
  },
  existingName: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
    fontFamily: 'Grift',
  },
  estimatedCost: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  estimatedCostLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    fontFamily: 'Grift',
  },
  estimatedCostValue: {
    fontSize: fontSize.lg,
    color: colors.secondary,
    fontFamily: 'GriftBold',
  },
  conflictsContainer: {
    backgroundColor: colors.error.light,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  conflictsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  conflictsTitle: {
    fontSize: fontSize.sm,
    color: colors.error.main,
    fontFamily: 'GriftBold',
    marginLeft: spacing.sm,
  },
  conflictItem: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: 4,
  },
  conflictTime: {
    fontSize: fontSize.sm,
    color: colors.error.dark,
    fontFamily: 'GriftBold',
  },
  conflictName: {
    fontSize: fontSize.xs,
    color: colors.error.main,
    fontFamily: 'Grift',
  },
  submitButton: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontFamily: 'GriftBold',
  },
});



