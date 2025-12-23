import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Settings, LogOut, ArrowLeft, MessageCircle } from 'lucide-react-native';
import { colors, spacing, fontSize, shadows } from '../utils/theme';
import BottomNavigation from '../components/BottomNavigation';
import SettingsMenu from '../components/SettingsMenu';
import ChatBubble from '../components/ChatBubble';

// Screens
import HomeContent from './HomeContent';
import DocumentsScreen from './DocumentsScreen';
import ContactsScreen from './ContactsScreen';
import NotificationsScreen from './NotificationsScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const logoFull = require('../../assets/logo_full.png');

const TAB_KEYS = ['home', 'documents', 'contacts', 'notifications'];
const TAB_TITLES = {
  home: null, // Logo
  documents: 'Documentos',
  contacts: 'Contatos',
  notifications: 'Notificações',
};

export default function MainTabScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('home');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const scrollViewRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const handleSettingsNavigate = (key) => {
    switch (key) {
      case 'profile':
        // navigation.navigate('Profile');
        break;
      case 'settings':
        // navigation.navigate('Settings');
        break;
      default:
        break;
    }
  };

  const handleTabPress = (tab) => {
    const index = TAB_KEYS.indexOf(tab);
    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    }
    setActiveTab(tab);
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    const newTab = TAB_KEYS[index];
    if (newTab && newTab !== activeTab) {
      setActiveTab(newTab);
    }
  };

  const handleBack = () => {
    handleTabPress('home');
  };

  const isHome = activeTab === 'home';
  const headerTitle = TAB_TITLES[activeTab];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        {isHome ? (
          <Image source={logoFull} style={styles.headerLogo} resizeMode="contain" />
        ) : (
          <View style={styles.headerTitleContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ArrowLeft size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
          </View>
        )}
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setSettingsVisible(true)}>
            <Settings size={24} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={logout}>
            <LogOut size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipeable Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        <View style={styles.page}>
          <HomeContent navigation={navigation} />
        </View>
        <View style={styles.page}>
          <DocumentsScreen />
        </View>
        <View style={styles.page}>
          <ContactsScreen />
        </View>
        <View style={styles.page}>
          <NotificationsScreen />
        </View>
      </ScrollView>

      {/* FAB - Botão de Chat */}
      <TouchableOpacity style={styles.fab} onPress={() => setChatVisible(true)}>
        <MessageCircle size={28} color={colors.white} />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />

      {/* Settings Menu */}
      <SettingsMenu
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        user={user}
        onNavigate={handleSettingsNavigate}
      />

      {/* Chat Bubble */}
      <ChatBubble
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        user={user}
      />
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
  headerLogo: {
    width: 140,
    height: 35,
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
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: 135,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
});
