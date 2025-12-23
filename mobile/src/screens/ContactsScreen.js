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
import { Phone, Users } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../utils/theme';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      // TODO: Buscar da API
      // const response = await api.get('/contacts');
      // setContacts(response.data);
      setContacts([]);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone) => {
    if (phone) {
      const phoneNumber = phone.replace(/\D/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const renderContact = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.role}</Text>
          <Text style={styles.cardAvailability}>
            Disponível: {item.availability}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.cardPhone}>{item.phone}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCall(item.phone)}
        >
          <Phone size={18} color={colors.white} />
          <Text style={styles.callButtonText}>Ligar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Users size={64} color={colors.gray[300]} />
      </View>
      <Text style={styles.emptyTitle}>Nenhum contato</Text>
      <Text style={styles.emptyText}>
        Os contatos do condomínio aparecerão aqui quando cadastrados
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={loadContacts}>
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
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshing={loading}
        onRefresh={loadContacts}
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
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
    marginRight: spacing.md,
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
  cardAvailability: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    fontFamily: 'Grift',
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.sm,
  },
  cardPhone: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontFamily: 'GriftBold',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  callButtonText: {
    fontSize: fontSize.sm,
    color: colors.white,
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
