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
  Image,
  Modal,
  TextInput,
} from 'react-native';
import {
  Users,
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
  FileText,
  MapPin,
  Eye,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import visitorService from '../services/visitorService';
import { colors, spacing, borderRadius, fontSize, shadows } from '../utils/theme';
import BottomNavigation from '../components/BottomNavigation';
import SettingsMenu from '../components/SettingsMenu';

// Tipos de visitante
const visitorTypes = {
  personal: 'Visitante',
  service: 'Prestador de Serviço',
  delivery: 'Entregador',
  taxi: 'Taxi/App',
  other: 'Outro',
};

const documentTypes = {
  rg: 'RG',
  cpf: 'CPF',
  cnh: 'CNH',
  other: 'Outro',
};

export default function VisitorValidationScreen({ navigation }) {
  const { user, resident, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [validationAction, setValidationAction] = useState(null); // 'approve' or 'reject'

  const condominiumId = resident?.condominium_id || user?.condominium_id;

  // Verificar se o usuário tem permissão
  const hasPermission = user?.access_level === 'sindico' || user?.access_level === 'administrador';

  useEffect(() => {
    if (!hasPermission) {
      Alert.alert('Acesso Negado', 'Você não tem permissão para acessar esta área.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    loadVisitors();
  }, [hasPermission]);

  const loadVisitors = useCallback(async () => {
    if (!condominiumId) return;

    try {
      // Buscar apenas visitantes pendentes de validação
      const response = await visitorService.getVisitors(condominiumId, { status: 'pending' });

      if (response.success) {
        setVisitors(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar visitantes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [condominiumId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadVisitors();
  };

  const handleViewDetails = (visitor) => {
    setSelectedVisitor(visitor);
    setDetailModalVisible(true);
  };

  const handleValidate = (action) => {
    setValidationAction(action);
    setNotesModalVisible(true);
  };

  const confirmValidation = async () => {
    if (!selectedVisitor || !validationAction) return;

    try {
      const response = await visitorService.validateVisitor(
        selectedVisitor.id,
        validationAction,
        notes || null
      );

      if (response.success) {
        Alert.alert(
          'Sucesso',
          validationAction === 'approve'
            ? 'Visitante aprovado com sucesso'
            : 'Visitante rejeitado'
        );
        setNotesModalVisible(false);
        setDetailModalVisible(false);
        setNotes('');
        setValidationAction(null);
        setSelectedVisitor(null);
        loadVisitors();
      } else {
        Alert.alert('Erro', response.error || 'Erro ao processar validação');
      }
    } catch (error) {
      console.error('Erro ao validar visitante:', error);
      Alert.alert('Erro', 'Erro ao validar visitante');
    }
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
    const visitorType = visitorTypes[item.visitor_type] || 'Visitante';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleViewDetails(item)}
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
          <View style={[styles.statusBadge, { backgroundColor: colors.warning.light }]}>
            <AlertTriangle size={14} color={colors.warning.main} />
            <Text style={[styles.statusText, { color: colors.warning.main }]}>
              Pendente
            </Text>
          </View>
        </View>

        {/* Informações */}
        <View style={styles.cardBody}>
          {item.unit && (
            <View style={styles.infoRow}>
              <MapPin size={16} color={colors.gray[600]} />
              <Text style={styles.infoText}>
                Unidade: {item.unit.block} {item.unit.number}
              </Text>
            </View>
          )}

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

          {item.purpose && (
            <Text style={styles.purposeText} numberOfLines={2}>
              {item.purpose}
            </Text>
          )}
        </View>

        {/* Ver Detalhes */}
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => handleViewDetails(item)}
        >
          <Eye size={16} color={colors.secondary} />
          <Text style={styles.viewDetailsText}>Ver Detalhes e Validar</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Users size={64} color={colors.gray[300]} />
      </View>
      <Text style={styles.emptyTitle}>Nenhuma validação pendente</Text>
      <Text style={styles.emptyText}>
        Não há visitantes aguardando validação no momento
      </Text>
    </View>
  );

  if (!hasPermission) {
    return null;
  }

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
          <Text style={styles.headerTitle}>Validar Visitantes</Text>
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

      {/* Lista de Visitantes Pendentes */}
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

      {/* Modal de Detalhes */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes do Visitante</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <XCircle size={24} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>

            {selectedVisitor && (
              <View style={styles.modalBody}>
                {/* Informações Básicas */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Nome</Text>
                  <Text style={styles.detailValue}>{selectedVisitor.name}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tipo de Visitante</Text>
                  <Text style={styles.detailValue}>
                    {visitorTypes[selectedVisitor.visitor_type]}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Documento</Text>
                  <Text style={styles.detailValue}>
                    {documentTypes[selectedVisitor.document_type]}
                    {selectedVisitor.document_number && `: ${selectedVisitor.document_number}`}
                  </Text>
                </View>

                {selectedVisitor.phone && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Telefone</Text>
                    <Text style={styles.detailValue}>{selectedVisitor.phone}</Text>
                  </View>
                )}

                {selectedVisitor.unit && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Unidade</Text>
                    <Text style={styles.detailValue}>
                      {selectedVisitor.unit.block} {selectedVisitor.unit.number}
                    </Text>
                  </View>
                )}

                {selectedVisitor.scheduled_date && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Data e Hora</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedVisitor.scheduled_date)}
                      {selectedVisitor.scheduled_time &&
                        ` às ${formatTime(selectedVisitor.scheduled_time)}`}
                    </Text>
                  </View>
                )}

                {selectedVisitor.purpose && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Motivo da Visita</Text>
                    <Text style={styles.detailValue}>{selectedVisitor.purpose}</Text>
                  </View>
                )}

                {/* Veículo */}
                {(selectedVisitor.vehicle_plate ||
                  selectedVisitor.vehicle_model ||
                  selectedVisitor.vehicle_color) && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Veículo</Text>
                    <Text style={styles.detailValue}>
                      {selectedVisitor.vehicle_plate &&
                        `Placa: ${selectedVisitor.vehicle_plate}\n`}
                      {selectedVisitor.vehicle_model &&
                        `Modelo: ${selectedVisitor.vehicle_model}\n`}
                      {selectedVisitor.vehicle_color && `Cor: ${selectedVisitor.vehicle_color}`}
                    </Text>
                  </View>
                )}

                {/* Fotos do Documento */}
                {(selectedVisitor.document_photo_front || selectedVisitor.document_photo_back) && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Documentos</Text>
                    <View style={styles.documentPhotos}>
                      {selectedVisitor.document_photo_front && (
                        <View style={styles.photoContainer}>
                          <Text style={styles.photoLabel}>Frente</Text>
                          <Image
                            source={{
                              uri: `${process.env.EXPO_PUBLIC_API_URL}/storage/${selectedVisitor.document_photo_front}`,
                            }}
                            style={styles.documentPhoto}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                      {selectedVisitor.document_photo_back && (
                        <View style={styles.photoContainer}>
                          <Text style={styles.photoLabel}>Verso</Text>
                          <Image
                            source={{
                              uri: `${process.env.EXPO_PUBLIC_API_URL}/storage/${selectedVisitor.document_photo_back}`,
                            }}
                            style={styles.documentPhoto}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Ações */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.rejectButton]}
                onPress={() => handleValidate('reject')}
              >
                <XCircle size={20} color={colors.white} />
                <Text style={styles.modalButtonText}>Rejeitar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.approveButton]}
                onPress={() => handleValidate('approve')}
              >
                <CheckCircle size={20} color={colors.white} />
                <Text style={styles.modalButtonText}>Aprovar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Notas */}
      <Modal
        visible={notesModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setNotesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notesModalContainer}>
            <Text style={styles.notesModalTitle}>
              {validationAction === 'approve' ? 'Aprovar Visitante' : 'Rejeitar Visitante'}
            </Text>
            <Text style={styles.notesModalSubtitle}>
              Adicione observações (opcional):
            </Text>
            <TextInput
              style={styles.notesInput}
              multiline
              numberOfLines={4}
              placeholder="Digite observações sobre a validação..."
              value={notes}
              onChangeText={setNotes}
            />
            <View style={styles.notesModalActions}>
              <TouchableOpacity
                style={[styles.notesModalButton, styles.notesCancelButton]}
                onPress={() => {
                  setNotesModalVisible(false);
                  setNotes('');
                  setValidationAction(null);
                }}
              >
                <Text style={styles.notesCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.notesModalButton, styles.notesConfirmButton]}
                onPress={confirmValidation}
              >
                <Text style={styles.notesConfirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
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
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondary,
  },
  viewDetailsText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: fontSize.xl,
    color: colors.primary,
    fontFamily: 'GriftBold',
  },
  modalBody: {
    padding: spacing.md,
    maxHeight: '70%',
  },
  detailSection: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    fontFamily: 'Grift',
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: fontSize.base,
    color: colors.gray[800],
    fontFamily: 'GriftBold',
  },
  documentPhotos: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  photoContainer: {
    flex: 1,
  },
  photoLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    fontFamily: 'GriftBold',
    marginBottom: spacing.xs,
  },
  documentPhoto: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  approveButton: {
    backgroundColor: colors.success.main,
  },
  rejectButton: {
    backgroundColor: colors.error.main,
  },
  modalButtonText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontFamily: 'GriftBold',
  },
  notesModalContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  notesModalTitle: {
    fontSize: fontSize.xl,
    color: colors.primary,
    fontFamily: 'GriftBold',
    marginBottom: spacing.sm,
  },
  notesModalSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    fontFamily: 'Grift',
    marginBottom: spacing.md,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    fontFamily: 'Grift',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  notesModalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  notesModalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  notesCancelButton: {
    backgroundColor: colors.gray[200],
  },
  notesConfirmButton: {
    backgroundColor: colors.secondary,
  },
  notesCancelButtonText: {
    fontSize: fontSize.base,
    color: colors.gray[700],
    fontFamily: 'GriftBold',
  },
  notesConfirmButtonText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontFamily: 'GriftBold',
  },
});
