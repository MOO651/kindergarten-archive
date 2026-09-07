const DB_NAME = 'kindergarten-archive-db';
const STORE_NAME = 'files';

const openDatabase = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);

  request.onupgradeneeded = () => {
    const database = request.result;
    const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
    store.createIndex('sectionId', 'sectionId', { unique: false });
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const runTransaction = async (mode, callback) => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = callback(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getFiles = async (sectionId) => {
  const files = await runTransaction('readonly', (store) =>
    store.index('sectionId').getAll(String(sectionId))
  );
  return files.sort((first, second) => second.createdAt - first.createdAt);
};

export const getAllFiles = async () => {
  const files = await runTransaction('readonly', (store) => store.getAll());
  return files.sort((first, second) => second.createdAt - first.createdAt);
};

export const saveFile = (file) => runTransaction('readwrite', (store) => store.put(file));
export const updateFile = (file) => runTransaction('readwrite', (store) => store.put(file));
export const deleteFile = (id) => runTransaction('readwrite', (store) => store.delete(id));

export const makeFileRecord = (file, sectionId, description = '') => ({
  id: `${Date.now()}-${crypto.randomUUID()}`,
  sectionId: String(sectionId),
  name: file.name,
  description,
  size: file.size,
  type: file.type || 'application/octet-stream',
  date: new Date().toISOString().split('T')[0],
  createdAt: Date.now(),
  blob: file,
});
