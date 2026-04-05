const noopSub = { unsubscribe: () => {} };

function emptySensor() {
  return {
    subscribe: () => noopSub,
  };
}

module.exports = {
  accelerometer: emptySensor(),
  gyroscope: emptySensor(),
  magnetometer: emptySensor(),
  barometer: emptySensor(),
  SensorTypes: {
    accelerometer: 'accelerometer',
    gyroscope: 'gyroscope',
  },
  setUpdateIntervalForType: () => {},
};
