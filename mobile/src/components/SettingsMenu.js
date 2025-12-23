import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { User, Settings, HelpCircle, FileText, X } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, shadows } from '../utils/theme';

export default function SettingsMenu({ visible, onClose, user, onNavigate }) {
  const menuItems = [
    { key: 'profile', label: 'Meu Perfil', icon: User },
    { key: 'settings', label: 'Configurações', icon: Settings },
    { key: 'terms', label: 'Termos de Uso', icon: FileText },
    { key: 'help', label: 'Ajuda', icon: HelpCircle },
  ];

  const handleItemPress = (key) => {
    onClose();
    onNavigate?.(key);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.menuContainer}>
          {/* Header do Menu */}
          <View style={styles.menuHeader}>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.name || 'Usuário'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || ''}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          {/* Divisor */}
          <View style={styles.divider} />

          {/* Itens do Menu */}
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              onPress={() => handleItemPress(item.key)}
            >
              <item.icon size={20} color={colors.gray[600]} />
              <Text style={styles.menuItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: spacing.md,
  },
  menuContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    width: 280,
    ...shadows.lg,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fontSize.xl,
    color: colors.white,
    fontFamily: 'GriftBold',
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  userName: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontFamily: 'GriftBold',
  },
  userEmail: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    fontFamily: 'Grift',
  },
  closeButton: {
    padding: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginHorizontal: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuItemText: {
    fontSize: fontSize.base,
    color: colors.primary,
    fontFamily: 'Grift',
    marginLeft: spacing.md,
  },
});
