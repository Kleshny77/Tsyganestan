import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const ACCENT = '#0A5C8A';

const ROLE_LABELS: Record<string, string> = {
  user: '👤 Турист',
  tour_agent: '🗺 Турагент',
  admin: '🔑 Администратор',
};

const ROLE_COLORS: Record<string, string> = {
  user: '#2E7D32',
  tour_agent: '#1565C0',
  admin: '#6A1B9A',
};

export default function ProfileScreen() {
  const { username, role, userId, signOut } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{username ? username[0].toUpperCase() : '?'}</Text>
        </View>
        <Text style={styles.username}>{username}</Text>
        <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[role ?? 'user'] + '18' }]}>
          <Text style={[styles.roleText, { color: ROLE_COLORS[role ?? 'user'] }]}>
            {ROLE_LABELS[role ?? 'user'] ?? role}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Информация об аккаунте</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ID</Text>
          <Text style={styles.infoValue}>#{userId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Имя пользователя</Text>
          <Text style={styles.infoValue}>{username}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Роль</Text>
          <Text style={styles.infoValue}>{ROLE_LABELS[role ?? ''] ?? role}</Text>
        </View>
      </View>

      {role === 'tour_agent' && (
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            🗺 Как турагент вы можете добавлять, редактировать и удалять свои туры на вкладке «Туры».
          </Text>
        </View>
      )}

      {role === 'admin' && (
        <View style={[styles.infoBox, { backgroundColor: '#F3E5F5' }]}>
          <Text style={[styles.infoBoxText, { color: '#6A1B9A' }]}>
            🔑 Вы — администратор. У вас полный доступ ко всем турам и управлению ролями через API.
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Text style={styles.logoutText}>Выйти из аккаунта</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  content: { padding: 20 },
  avatarBox: { alignItems: 'center', paddingVertical: 32 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  username: { fontSize: 22, fontWeight: '800', color: '#1A2332', marginBottom: 8 },
  roleBadge: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  roleText: { fontSize: 13, fontWeight: '700' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  infoLabel: { fontSize: 14, color: '#888' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1A2332' },
  infoBox: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  infoBoxText: { fontSize: 13, color: '#0A5C8A', lineHeight: 20 },
  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E53935',
    marginTop: 8,
  },
  logoutText: { color: '#E53935', fontWeight: '700', fontSize: 15 },
});
