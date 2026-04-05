import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  listTours,
  createTour,
  updateTour,
  deleteTour,
  Tour,
  TourPayload,
} from '../api/tours';
import { ApiError } from '../api/client';

const ACCENT = '#0A5C8A';
const ACCENT_LIGHT = '#E8F4FD';

function formatPrice(price: number) {
  return price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

const EMPTY_FORM: TourPayload = { title: '', description: '', price: 0, location: '' };

export default function ToursScreen() {
  const { token, role, userId } = useAuth();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [form, setForm] = useState<TourPayload>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const canManage = role === 'tour_agent' || role === 'admin';

  const loadTours = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await listTours();
      setTours(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTours();
  }, [loadTours]);

  const openCreate = () => {
    setEditingTour(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormVisible(true);
  };

  const openEdit = (tour: Tour) => {
    setEditingTour(tour);
    setForm({
      title: tour.title,
      description: tour.description,
      price: tour.price,
      location: tour.location,
    });
    setFormError(null);
    setDetailVisible(false);
    setFormVisible(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.location || !form.price) {
      setFormError('Заполните все поля');
      return;
    }
    if (!token) return;
    setFormLoading(true);
    setFormError(null);
    try {
      if (editingTour) {
        await updateTour(editingTour.id, form, token);
      } else {
        await createTour(form, token);
      }
      setFormVisible(false);
      loadTours(true);
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Ошибка сохранения');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (tour: Tour) => {
    if (!token) return;
    const confirm = window.confirm(`Удалить тур «${tour.title}»?`);
    if (!confirm) return;
    try {
      await deleteTour(tour.id, token);
      setDetailVisible(false);
      loadTours(true);
    } catch (e) {
      Alert.alert('Ошибка', e instanceof ApiError ? e.message : 'Не удалось удалить');
    }
  };

  const canEditTour = (tour: Tour) =>
    role === 'admin' || (role === 'tour_agent' && tour.created_by === userId);

  const renderTour = ({ item }: { item: Tour }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedTour(item);
        setDetailVisible(true);
      }}
      activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardLocation}>📍 {item.location}</Text>
        <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc} numberOfLines={2}>
        {item.description}
      </Text>
      <Text style={styles.cardDate}>Добавлено {formatDate(item.created_at)}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={styles.loadingText}>Загружаем туры...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>⚠️ Ошибка</Text>
        <Text style={styles.errorMsg}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadTours()}>
          <Text style={styles.retryText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Туры</Text>
        {canManage && (
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Text style={styles.addBtnText}>+ Добавить</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={tours}
        keyExtractor={t => String(t.id)}
        renderItem={renderTour}
        contentContainerStyle={styles.list}
        onRefresh={() => {
          setRefreshing(true);
          loadTours(true);
        }}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>🏝 Туров пока нет</Text>
            {canManage && (
              <Text style={styles.emptyHint}>Добавьте первый тур!</Text>
            )}
          </View>
        }
      />

      {/* Tour detail modal */}
      <Modal
        visible={detailVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selectedTour && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeaderRow}>
                  <TouchableOpacity onPress={() => setDetailVisible(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.detailLocation}>📍 {selectedTour.location}</Text>
                <Text style={styles.detailTitle}>{selectedTour.title}</Text>
                <Text style={styles.detailPrice}>{formatPrice(selectedTour.price)}</Text>
                <Text style={styles.detailDesc}>{selectedTour.description}</Text>
                <Text style={styles.detailMeta}>
                  Добавлено {formatDate(selectedTour.created_at)}
                </Text>
                {canEditTour(selectedTour) && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.editBtn]}
                      onPress={() => openEdit(selectedTour)}>
                      <Text style={styles.actionBtnText}>✏️ Редактировать</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => handleDelete(selectedTour)}>
                      <Text style={[styles.actionBtnText, { color: '#E53935' }]}>🗑 Удалить</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Create / edit form modal */}
      <Modal
        visible={formVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFormVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeaderRow}>
                <Text style={styles.formTitle}>
                  {editingTour ? 'Редактировать тур' : 'Новый тур'}
                </Text>
                <TouchableOpacity onPress={() => setFormVisible(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {formError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorBoxText}>{formError}</Text>
                </View>
              ) : null}

              {(
                [
                  { key: 'title', label: 'Название', placeholder: 'Тур мечты в Сочи' },
                  { key: 'location', label: 'Место', placeholder: 'Сочи, Россия' },
                  { key: 'price', label: 'Цена (₽)', placeholder: '99999', numeric: true },
                ] as const
              ).map(({ key, label, placeholder, numeric }) => (
                <View key={key}>
                  <Text style={styles.label}>{label}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    keyboardType={numeric ? 'numeric' : 'default'}
                    value={key === 'price' ? (form.price === 0 ? '' : String(form.price)) : form[key]}
                    onChangeText={v =>
                      setForm(f => ({
                        ...f,
                        [key]: key === 'price' ? (parseFloat(v) || 0) : v,
                      }))
                    }
                  />
                </View>
              ))}

              <Text style={styles.label}>Описание</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Расскажите о туре..."
                multiline
                numberOfLines={4}
                value={form.description}
                onChangeText={v => setForm(f => ({ ...f, description: v }))}
              />

              <TouchableOpacity
                style={[styles.button, formLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={formLoading}>
                {formLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {editingTour ? 'Сохранить' : 'Добавить тур'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF2',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1A2332' },
  addBtn: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardLocation: { fontSize: 12, color: '#888' },
  cardPrice: { fontSize: 15, fontWeight: '800', color: ACCENT },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A2332', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 8 },
  cardDate: { fontSize: 11, color: '#AAB' },
  loadingText: { marginTop: 12, color: '#888', fontSize: 14 },
  errorTitle: { fontSize: 20, color: '#E53935', marginBottom: 8 },
  errorMsg: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: ACCENT, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  retryText: { color: '#fff', fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 20, color: '#AAB', marginBottom: 8 },
  emptyHint: { fontSize: 14, color: '#AAB' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalClose: { fontSize: 20, color: '#888', padding: 4 },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#1A2332' },
  detailLocation: { fontSize: 13, color: '#888', marginBottom: 4 },
  detailTitle: { fontSize: 22, fontWeight: '800', color: '#1A2332', marginBottom: 8 },
  detailPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: ACCENT,
    marginBottom: 12,
  },
  detailDesc: { fontSize: 15, color: '#444', lineHeight: 22, marginBottom: 16 },
  detailMeta: { fontSize: 12, color: '#AAB', marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  editBtn: { borderColor: ACCENT, backgroundColor: ACCENT_LIGHT },
  deleteBtn: { borderColor: '#E53935', backgroundColor: '#FFF0F0' },
  actionBtnText: { fontWeight: '600', fontSize: 14, color: ACCENT },
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
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E53935',
  },
  errorBoxText: { color: '#E53935', fontSize: 13 },
  button: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
