const DB_NAME = 'kindergarten-archive-db';
const STORE_NAME = 'files';
const BUCKET_NAME = 'archive-files';

import { isRemoteStorageConfigured, supabase } from './supabase';

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
  if (isRemoteStorageConfigured) {
    const { data, error } = await supabase
      .from('archive_files')
      .select('*')
      .eq('section_id', String(sectionId))
      .order('created_at', { ascending: false });
    if (error) throw error;
    return hydrateRemoteFiles(data);
  }
  const files = await runTransaction('readonly', (store) =>
    store.index('sectionId').getAll(String(sectionId))
  );
  return files.sort((first, second) => second.createdAt - first.createdAt);
};

export const getAllFiles = async () => {
  if (isRemoteStorageConfigured) {
    const { data, error } = await supabase
      .from('archive_files')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return hydrateRemoteFiles(data);
  }
  const files = await runTransaction('readonly', (store) => store.getAll());
  return files.sort((first, second) => second.createdAt - first.createdAt);
};

export const saveFile = async (file) => {
  if (!isRemoteStorageConfigured) return runTransaction('readwrite', (store) => store.put(file));
  const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(file.storagePath, file.blob, { upsert: true, contentType: file.type });
  if (uploadError) throw uploadError;
  const { error } = await supabase.from('archive_files').insert(toRemoteRecord(file));
  if (error) throw error;
};

export const updateFile = async (file) => {
  if (!isRemoteStorageConfigured) return runTransaction('readwrite', (store) => store.put(file));
  const { error } = await supabase.from('archive_files').update({ name: file.name, description: file.description }).eq('id', file.id);
  if (error) throw error;
};

export const deleteFile = async (id) => {
  if (!isRemoteStorageConfigured) return runTransaction('readwrite', (store) => store.delete(id));
  const { data } = await supabase.from('archive_files').select('storage_path').eq('id', id).single();
  if (data?.storage_path) await supabase.storage.from(BUCKET_NAME).remove([data.storage_path]);
  const { error } = await supabase.from('archive_files').delete().eq('id', id);
  if (error) throw error;
};

export const downloadFile = async (file) => {
  if (!isRemoteStorageConfigured) return file.blob;
  const { data, error } = await supabase.storage.from(BUCKET_NAME).download(file.storagePath);
  if (error) throw error;
  return data;
};

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
  storagePath: `${sectionId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
});

const toRemoteRecord = (file) => ({
  id: file.id,
  section_id: file.sectionId,
  name: file.name,
  description: file.description,
  size: file.size,
  type: file.type,
  date: file.date,
  created_at: file.createdAt,
  storage_path: file.storagePath,
});

const hydrateRemoteFiles = async (records) => records.map((record) => ({
  ...record,
  sectionId: record.section_id,
  createdAt: record.created_at,
  storagePath: record.storage_path,
  blob: null,
}));
