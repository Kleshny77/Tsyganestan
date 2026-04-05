/**
 * Web (webpack only): обход @react-native-async-storage в бандле — иначе Safari/WebKit
 * ловят ReferenceError на `exports` из-за смешения CJS/ESM после Babel.
 * Metro (iOS/Android) этот файл не использует.
 */
const memory = new Map();

function useLocalStorage() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

const AsyncStorage = {
  getItem(key) {
    const ls = useLocalStorage();
    if (ls) return Promise.resolve(ls.getItem(key));
    return Promise.resolve(memory.has(key) ? memory.get(key) : null);
  },
  setItem(key, value) {
    const s = value == null ? '' : String(value);
    try {
      const ls = useLocalStorage();
      if (ls) ls.setItem(key, s);
      else memory.set(key, s);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
  removeItem(key) {
    try {
      const ls = useLocalStorage();
      if (ls) ls.removeItem(key);
      else memory.delete(key);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
  clear() {
    try {
      const ls = useLocalStorage();
      if (ls) ls.clear();
      else memory.clear();
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
  getAllKeys() {
    try {
      const ls = useLocalStorage();
      if (ls) return Promise.resolve(Object.keys(ls));
      return Promise.resolve(Array.from(memory.keys()));
    } catch (e) {
      return Promise.reject(e);
    }
  },
};

export default AsyncStorage;
