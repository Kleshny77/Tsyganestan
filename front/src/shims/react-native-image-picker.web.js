/**
 * Web (webpack): пакет публикует main = src/index.ts — без Babel в node_modules webpack не парсит TS.
 * Достаточно launchImageLibrary для экранов профиля/тура/травы.
 */
export function launchCamera(options, callback) {
  const result = {
    errorCode: 'others',
    errorMessage: 'Camera is not available in this web build',
  };
  if (callback) callback(result);
  return Promise.resolve(result);
}

export function launchImageLibrary(options, callback) {
  const result = { didCancel: true };
  if (callback) callback(result);
  return Promise.resolve(result);
}
