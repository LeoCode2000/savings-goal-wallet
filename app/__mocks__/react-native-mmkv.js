const values = new Map();

module.exports = {
  createMMKV: () => ({
    getString: key => values.get(key),
    set: (key, value) => values.set(key, value),
    remove: key => values.delete(key),
  }),
};