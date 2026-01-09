import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import {
  X,
  User,
  Phone,
  Calendar,
  Clock,
  Car,
  FileText,
  Camera,
  Image as ImageIcon,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, fontSize } from '../../utils/theme';
import visitorService from '../../services/visitorService';

export default function VisitorModal({
  visible,
  onClose,
  onSuccess,
  condominiumId,
  unitId,
  visitor = null, // Se fornecido, é modo edição
}) {
  const isEdit = !!visitor;

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    document_type: 'cpf',
    document_number: '',
    phone: '',
    visitor_type: 'personal',
    purpose: '',
    scheduled_date: '',
    scheduled_time: '',
    vehicle_plate: '',
    vehicle_model: '',
    vehicle_color: '',
  });

  const [documentPhotoFront, setDocumentPhotoFront] = useState(null);
  const [documentPhotoBack, setDocumentPhotoBack] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visitor) {
      setFormData({
        name: visitor.name || '',
        document_type: visitor.document_type || 'cpf',
        document_number: visitor.document_number || '',
        phone: visitor.phone || '',
        visitor_type: visitor.visitor_type || 'personal',
        purpose: visitor.purpose || '',
        scheduled_date: visitor.scheduled_date || '',
        scheduled_time: visitor.scheduled_time || '',
        vehicle_plate: visitor.vehicle_plate || '',
        vehicle_model: visitor.vehicle_model || '',
        vehicle_color: visitor.vehicle_color || '',
      });
    }
  }, [visitor]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      handleChange('scheduled_date', dateStr);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const timeStr = selectedTime.toTimeString().split(' ')[0].substring(0, 5);
      handleChange('scheduled_time', timeStr);
    }
  };

  const pickImage = async (type) => {
    try {
      // Solicitar permissão
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos');
          return;
        }
      }

      Alert.alert(
        'Selecionar Foto',
        'Escolha uma opção:',
        [
          {
            text: 'Câmera',
            onPress: () => takePhoto(type),
          },
          {
            text: 'Galeria',
            onPress: () => pickFromGallery(type),
          },
          {
            text: 'Cancelar',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      Alert.alert('Erro', 'Erro ao acessar galeria de fotos');
    }
  };

  const takePhoto = async (type) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para usar a câmera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'front') {
          setDocumentPhotoFront(result.assets[0].uri);
        } else {
          setDocumentPhotoBack(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Erro ao capturar foto');
    }
  };

  const pickFromGallery = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'front') {
          setDocumentPhotoFront(result.assets[0].uri);
        } else {
          setDocumentPhotoBack(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Erro ao selecionar imagem');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Atenção', 'Por favor, informe o nome do visitante');
      return false;
    }

    if (!isEdit && !documentPhotoFront) {
      Alert.alert('Atenção', 'Por favor, adicione a foto da frente do documento');
      return false;
    }

    if (!isEdit && !documentPhotoBack) {
      Alert.alert('Atenção', 'Por favor, adicione a foto do verso do documento');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        unit_id: unitId,
      };

      // Converter fotos para base64 se foram fornecidas
      if (documentPhotoFront) {
        submitData.document_photo_front = await visitorService.imageToBase64(documentPhotoFront);
      }

      if (documentPhotoBack) {
        submitData.document_photo_back = await visitorService.imageToBase64(documentPhotoBack);
      }

      let response;
      if (isEdit) {
        response = await visitorService.updateVisitor(visitor.id, submitData);
      } else {
        response = await visitorService.createVisitor(condominiumId, submitData);
      }

      if (response.success) {
        Alert.alert('Sucesso', response.message);
        onSuccess();
        handleClose();
      } else {
        Alert.alert('Erro', response.error || 'Erro ao salvar visitante');
      }
    } catch (error) {
      console.error('Erro ao salvar visitante:', error);
      Alert.alert('Erro', 'Erro ao salvar visitante');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      document_type: 'cpf',
      document_number: '',
      phone: '',
      visitor_type: 'personal',
      purpose: '',
      scheduled_date: '',
      scheduled_time: '',
      vehicle_plate: '',
      vehicle_model: '',
      vehicle_color: '',
    });
    setDocumentPhotoFront(null);
    setDocumentPhotoBack(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEdit ? 'Editar Visitante' : 'Novo Visitante'}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={colors.gray[600]} />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo *</Text>
              <View style={styles.inputContainer}>
                <User size={20} color={colors.gray[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome do visitante"
                  placeholderTextColor={colors.gray[400]}
                  value={formData.name}
                  onChangeText={(text) => handleChange('name', text)}
                />
              </View>
            </View>

            {/* Tipo de Visitante */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Visitante</Text>
              <View style={styles.radioGroup}>
                {[
                  { value: 'personal', label: 'Visitante' },
                  { value: 'service', label: 'Prestador' },
                  { value: 'delivery', label: 'Entrega' },
                  { value: 'taxi', label: 'Taxi/App' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.radioButton,
                      formData.visitor_type === option.value && styles.radioButtonActive,
                    ]}
                    onPress={() => handleChange('visitor_type', option.value)}
                  >
                    <Text
                      style={[
                        styles.radioButtonText,
                        formData.visitor_type === option.value && styles.radioButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tipo de Documento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Documento</Text>
              <View style={styles.radioGroup}>
                {[
                  { value: 'cpf', label: 'CPF' },
                  { value: 'rg', label: 'RG' },
                  { value: 'cnh', label: 'CNH' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.radioButton,
                      formData.document_type === option.value && styles.radioButtonActive,
                    ]}
                    onPress={() => handleChange('document_type', option.value)}
                  >
                    <Text
                      style={[
                        styles.radioButtonText,
                        formData.document_type === option.value && styles.radioButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Número do Documento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número do Documento</Text>
              <View style={styles.inputContainer}>
                <FileText size={20} color={colors.gray[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="000.000.000-00"
                  placeholderTextColor={colors.gray[400]}
                  value={formData.document_number}
                  onChangeText={(text) => handleChange('document_number', text)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Fotos do Documento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fotos do Documento *</Text>
              <View style={styles.photoRow}>
                {/* Frente */}
                <TouchableOpacity
                  style={styles.photoBox}
                  onPress={() => pickImage('front')}
                >
                  {documentPhotoFront ? (
                    <Image source={{ uri: documentPhotoFront }} style={styles.photoPreview} />
                  ) : (
                    <>
                      <Camera size={32} color={colors.gray[400]} />
                      <Text style={styles.photoBoxText}>Frente</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Verso */}
                <TouchableOpacity
                  style={styles.photoBox}
                  onPress={() => pickImage('back')}
                >
                  {documentPhotoBack ? (
                    <Image source={{ uri: documentPhotoBack }} style={styles.photoPreview} />
                  ) : (
                    <>
                      <Camera size={32} color={colors.gray[400]} />
                      <Text style={styles.photoBoxText}>Verso</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Telefone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color={colors.gray[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor={colors.gray[400]}
                  value={formData.phone}
                  onChangeText={(text) => handleChange('phone', text)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Data Agendada */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data da Visita</Text>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color={colors.gray[400]} />
                <Text style={[styles.input, !formData.scheduled_date && styles.placeholder]}>
                  {formData.scheduled_date
                    ? new Date(formData.scheduled_date + 'T00:00:00').toLocaleDateString('pt-BR')
                    : 'Selecione a data'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Hora Agendada */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Horário da Visita</Text>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={20} color={colors.gray[400]} />
                <Text style={[styles.input, !formData.scheduled_time && styles.placeholder]}>
                  {formData.scheduled_time || 'Selecione o horário'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Motivo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Motivo da Visita</Text>
              <TextInput
                style={[styles.inputContainer, styles.textArea]}
                placeholder="Descreva o motivo da visita..."
                placeholderTextColor={colors.gray[400]}
                value={formData.purpose}
                onChangeText={(text) => handleChange('purpose', text)}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Dados do Veículo */}
            <Text style={styles.sectionTitle}>Dados do Veículo (opcional)</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Placa</Text>
              <View style={styles.inputContainer}>
                <Car size={20} color={colors.gray[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="ABC-1234"
                  placeholderTextColor={colors.gray[400]}
                  value={formData.vehicle_plate}
                  onChangeText={(text) => handleChange('vehicle_plate', text.toUpperCase())}
                  maxLength={8}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Modelo</Text>
              <TextInput
                style={styles.inputContainer}
                placeholder="Ex: Gol, Civic, etc."
                placeholderTextColor={colors.gray[400]}
                value={formData.vehicle_model}
                onChangeText={(text) => handleChange('vehicle_model', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cor</Text>
              <TextInput
                style={styles.inputContainer}
                placeholder="Ex: Preto, Branco, etc."
                placeholderTextColor={colors.gray[400]}
                value={formData.vehicle_color}
                onChangeText={(text) => handleChange('vehicle_color', text)}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleClose}
            disabled={submitting}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEdit ? 'Atualizar' : 'Cadastrar'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={formData.scheduled_date ? new Date(formData.scheduled_date + 'T00:00:00') : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontFamily: 'GriftBold',
    color: colors.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: 'GriftBold',
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    fontFamily: 'Grift',
    color: colors.gray[900],
  },
  placeholder: {
    color: colors.gray[400],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingVertical: spacing.sm,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  radioButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  radioButtonActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  radioButtonText: {
    fontSize: fontSize.sm,
    fontFamily: 'Grift',
    color: colors.gray[700],
  },
  radioButtonTextActive: {
    fontFamily: 'GriftBold',
    color: colors.white,
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoBox: {
    flex: 1,
    aspectRatio: 1.5,
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
  },
  photoBoxText: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    fontFamily: 'Grift',
    color: colors.gray[500],
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'GriftBold',
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray[200],
  },
  cancelButtonText: {
    fontSize: fontSize.base,
    fontFamily: 'GriftBold',
    color: colors.gray[700],
  },
  submitButton: {
    backgroundColor: colors.secondary,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: fontSize.base,
    fontFamily: 'GriftBold',
    color: colors.white,
  },
});
