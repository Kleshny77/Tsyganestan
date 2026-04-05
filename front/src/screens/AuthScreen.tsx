import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../api/auth';
import { ApiError } from '../api/client';

type Tab = 'login' | 'register';
type RegisterRole = 'user' | 'tour_agent';

export default function AuthScreen() {
  const { signIn } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [regForm, setRegForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' as RegisterRole,
  });

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      setError('Заполните все поля');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await login(loginForm.username, loginForm.password);
      signIn(res.access_token);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regForm.username || !regForm.email || !regForm.password) {
      setError('Заполните все поля');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(regForm.username, regForm.email, regForm.password, regForm.role);
      const res = await login(regForm.username, regForm.password);
      signIn(res.access_token);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.logo}>✈ Цыганестан</Text>
          <Text style={styles.tagline}>Туры, которые вы не забудете (и захотите)</Text>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'login' && styles.tabBtnActive]}
              onPress={() => {
                setTab('login');
                setError(null);
              }}>
              <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Войти</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'register' && styles.tabBtnActive]}
              onPress={() => {
                setTab('register');
                setError(null);
              }}>
              <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>
                Регистрация
              </Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {tab === 'login' ? (
            <View>
              <Text style={styles.label}>Имя пользователя</Text>
              <TextInput
                style={styles.input}
                placeholder="username"
                autoCapitalize="none"
                value={loginForm.username}
                onChangeText={v => setLoginForm(f => ({ ...f, username: v }))}
              />
              <Text style={styles.label}>Пароль</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry
                value={loginForm.password}
                onChangeText={v => setLoginForm(f => ({ ...f, password: v }))}
              />
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Войти</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.label}>Имя пользователя</Text>
              <TextInput
                style={styles.input}
                placeholder="username"
                autoCapitalize="none"
                value={regForm.username}
                onChangeText={v => setRegForm(f => ({ ...f, username: v }))}
              />
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={regForm.email}
                onChangeText={v => setRegForm(f => ({ ...f, email: v }))}
              />
              <Text style={styles.label}>Пароль</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry
                value={regForm.password}
                onChangeText={v => setRegForm(f => ({ ...f, password: v }))}
              />
              <Text style={styles.label}>Тип аккаунта</Text>
              <View style={styles.roleRow}>
                {(['user', 'tour_agent'] as RegisterRole[]).map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleBtn, regForm.role === r && styles.roleBtnActive]}
                    onPress={() => setRegForm(f => ({ ...f, role: r }))}>
                    <Text style={[styles.roleText, regForm.role === r && styles.roleTextActive]}>
                      {r === 'user' ? '👤 Турист' : '🗺 Турагент'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Зарегистрироваться</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ACCENT = '#0A5C8A';
const ACCENT_LIGHT = '#E8F4FD';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0F4F8',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: ACCENT,
    textAlign: 'center',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 14, color: '#888', fontWeight: '500' },
  tabTextActive: { color: ACCENT, fontWeight: '700' },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#E53935',
  },
  errorText: { color: '#E53935', fontSize: 13 },
  label: { fontSize: 13, color: '#555', fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#DDE3ED',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#FAFBFC',
  },
  button: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#DDE3ED',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
  },
  roleBtnActive: { borderColor: ACCENT, backgroundColor: ACCENT_LIGHT },
  roleText: { fontSize: 13, color: '#666', fontWeight: '500' },
  roleTextActive: { color: ACCENT, fontWeight: '700' },
});
