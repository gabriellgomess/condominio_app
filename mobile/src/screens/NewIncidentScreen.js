import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { incidentService } from '../services/incidentService';
import { MapPin, Image as ImageIcon, Camera, Check } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../utils/theme';

export default function NewIncidentScreen({ navigation }) {
  const { user, resident } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    priority: '',
    location: '',
    photos: [],
    is_anonymous: false,
    is_common_area: false,
  });

  const types = incidentService.getTypes();
  const priorities = incidentService.getPriorities();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, ...result.assets],
        }));
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar a câmera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, ...result.assets],
        }));
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o título');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a descrição');
      return false;
    }
    if (!formData.type) {
      Alert.alert('Erro', 'Por favor, selecione o tipo');
      return false;
    }
    if (!formData.priority) {
      Alert.alert('Erro', 'Por favor, selecione a prioridade');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o local');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = new FormData();

      // Adicionar campos
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('type', formData.type);
      submitData.append('priority', formData.priority);
      submitData.append('location', formData.location);
      submitData.append('incident_date', new Date().toISOString());
      submitData.append('is_anonymous', formData.is_anonymous ? '1' : '0');

      // Adicionar dados do morador
      if (resident) {
        submitData.append('condominium_id', resident.condominium_id);

        // Se não for área comum, adicionar bloco e unidade
        if (!formData.is_common_area) {
          if (resident.block_id) {
            submitData.append('block_id', resident.block_id);
          }
          if (resident.unit_id) {
            submitData.append('unit_id', resident.unit_id);
          }
        }
      }

      // Adicionar fotos
      formData.photos.forEach((photo, index) => {
        const uri = Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri;
        const filename = photo.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        submitData.append('photos[]', {
          uri: photo.uri,
          name: filename,
          type,
        });
      });

      console.log('Enviando ocorrência...');
      const result = await incidentService.createIncident(submitData);

      if (result.success) {
        Alert.alert('Sucesso', 'Ocorrência registrada com sucesso!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Erro', result.message || 'Erro ao registrar ocorrência');
      }
    } catch (error) {
      console.error('Erro ao enviar:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao registrar a ocorrência');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Ocorrência</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Título */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Vazamento no banheiro"
            placeholderTextColor={colors.gray[400]}
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            editable={!loading}
          />
        </View>

        {/* Tipo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo *</Text>
          <View style={styles.chipsContainer}>
            {Object.entries(types).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.chip,
                  formData.type === key && styles.chipSelected,
                ]}
                onPress={() => handleInputChange('type', key)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.chipText,
                    formData.type === key && styles.chipTextSelected,
                  ]}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Prioridade */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prioridade *</Text>
          <View style={styles.chipsContainer}>
            {Object.entries(priorities).map(([key, value]) => {
              const priorityColor = colors.priority[key];
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.chip,
                    formData.priority === key && {
                      backgroundColor: priorityColor.bg,
                      borderColor: priorityColor.text,
                    },
                  ]}
                  onPress={() => handleInputChange('priority', key)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.chipText,
                      formData.priority === key && { color: priorityColor.text },
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tipo de Local */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo de Local *</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => handleInputChange('is_common_area', false)}
              disabled={loading}
            >
              <View style={[styles.radio, !formData.is_common_area && styles.radioSelected]}>
                {!formData.is_common_area && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioLabel}>Minha Unidade</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => handleInputChange('is_common_area', true)}
              disabled={loading}
            >
              <View style={[styles.radio, formData.is_common_area && styles.radioSelected]}>
                {formData.is_common_area && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioLabel}>Área Comum</Text>
            </TouchableOpacity>
          </View>
          {resident && !formData.is_common_area && (
            <View style={styles.infoBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MapPin size={16} color={colors.primary} />
                <Text style={[styles.infoText, { marginLeft: 6 }]}>
                  {resident.block_name ? `${resident.block_name} - ` : ''}Unidade {resident.unit_number}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Local */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {formData.is_common_area ? 'Especifique o Local *' : 'Detalhes do Local *'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={
              formData.is_common_area
                ? 'Ex: Piscina, Salão de festas, Portaria...'
                : 'Ex: Sala, Quarto, Banheiro...'
            }
            placeholderTextColor={colors.gray[400]}
            value={formData.location}
            onChangeText={(value) => handleInputChange('location', value)}
            editable={!loading}
          />
        </View>

        {/* Descrição */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva detalhadamente a ocorrência..."
            placeholderTextColor={colors.gray[400]}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>

        {/* Fotos */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fotos (opcional)</Text>
          <View style={styles.photosButtons}>
            <TouchableOpacity
              style={[styles.photoButton, shadows.sm]}
              onPress={pickImage}
              disabled={loading}
            >
              <ImageIcon color={colors.secondary} size={28} style={{ marginBottom: spacing.xs }} />
              <Text style={styles.photoButtonText}>Galeria</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.photoButton, shadows.sm]}
              onPress={takePhoto}
              disabled={loading}
            >
              <Camera color={colors.secondary} size={28} style={{ marginBottom: spacing.xs }} />
              <Text style={styles.photoButtonText}>Câmera</Text>
            </TouchableOpacity>
          </View>

          {formData.photos.length > 0 && (
            <View style={styles.photosPreview}>
              {formData.photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Text style={styles.removePhotoText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Anônimo */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleInputChange('is_anonymous', !formData.is_anonymous)}
          disabled={loading}
        >
          <View style={[styles.checkbox, formData.is_anonymous && styles.checkboxChecked]}>
            {formData.is_anonymous && <Check color={colors.white} size={16} />}
          </View>
          <Text style={styles.checkboxLabel}>Registrar como anônimo</Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled, shadows.md]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Registrar Ocorrência</Text>
          )}
        </TouchableOpacity>
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
    paddingBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginBottom: spacing.sm,
    fontFamily: 'GriftBold',
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.primary,
  },
  textArea: {
    minHeight: 120,
    paddingTop: spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  chipSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.gray[700],
    fontFamily: 'GriftBold',
  },
  chipTextSelected: {
    color: colors.white,
  },
  photosButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  photoButtonIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  photoButtonText: {
    fontSize: fontSize.sm,
    color: colors.gray[700],
    fontFamily: 'GriftBold',
  },
  photosPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  photoContainer: {
    position: 'relative',
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error.main,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: 'GriftBold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  checkboxCheck: {
    color: colors.white,
    fontSize: fontSize.base,
    fontFamily: 'GriftBold',
  },
  checkboxLabel: {
    fontSize: fontSize.base,
    color: colors.gray[700],
    fontFamily: 'Grift',
  },
  submitButton: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontFamily: 'GriftBold',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  radioSelected: {
    borderColor: colors.secondary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary,
  },
  radioLabel: {
    fontSize: fontSize.base,
    color: colors.gray[700],
    fontFamily: 'GriftBold',
  },
  infoBox: {
    backgroundColor: colors.secondary + '15',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontFamily: 'GriftBold',
  },
});
