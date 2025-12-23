import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, FileText, Phone, Bell } from 'lucide-react-native';
import { colors, spacing, fontSize } from '../utils/theme';

const tabs = [
  { key: 'home', label: 'Início', icon: Home },
  { key: 'documents', label: 'Documentos', icon: FileText },
  { key: 'contacts', label: 'Contatos', icon: Phone },
  { key: 'notifications', label: 'Notificações', icon: Bell },
];

export default function BottomNavigation({ activeTab = 'home', onTabPress }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.sm }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const IconComponent = tab.icon;
        
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress?.(tab.key)}
          >
            <IconComponent
              size={24}
              color={isActive ? colors.secondary : colors.gray[400]}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    fontFamily: 'Grift',
    marginTop: 4,
  },
  labelActive: {
    color: colors.secondary,
    fontFamily: 'GriftBold',
  },
});

