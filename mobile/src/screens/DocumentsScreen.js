import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Download, FileText } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../utils/theme';

// Status badge colors
const statusStyles = {
  pendente: { bg: colors.secondary, text: colors.white },
  atrasado: { bg: colors.error.main, text: colors.white },
  pago: { bg: colors.primary, text: colors.white },
};

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      // TODO: Buscar da API
      // const response = await api.get('/documents');
      // setDocuments(response.data);
      setDocuments([]);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (document) => {
    if (document.url) {
      Linking.openURL(document.url);
    }
  };

  const getStatusStyle = (status) => {
    const key = status?.toLowerCase() || 'pendente';
    return statusStyles[key] || statusStyles.pendente;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const renderDocument = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>
              {item.status}
            </Text>
          </View>
        </View>
        
        <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
        
        <Text style={styles.cardDescription}>{item.description}</Text>
        
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => handleDownload(item)}
        >
          <Download size={16} color={colors.primary} />
          <Text style={styles.downloadText}>Baixe aqui</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <FileText size={64} color={colors.gray[300]} />
      </View>
      <Text style={styles.emptyTitle}>Nenhum documento</Text>
      <Text style={styles.emptyText}>
        Seus documentos aparecerão aqui quando estiverem disponíveis
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={loadDocuments}>
        <Text style={styles.emptyButtonText}>Atualizar</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={documents}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshing={loading}
        onRefresh={loadDocuments}
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
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontFamily: 'GriftBold',
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontFamily: 'GriftBold',
  },
  cardDate: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    fontFamily: 'Grift',
    marginBottom: spacing.sm,
  },
  cardDescription: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    fontFamily: 'Grift',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  downloadText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontFamily: 'Grift',
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
