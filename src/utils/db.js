import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, getDocs, query, where, orderBy,
  serverTimestamp, getDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

// ─── Items ────────────────────────────────────────────────────────────────────

export const createItem = async (data, imageFile) => {
  const docRef = await addDoc(collection(db, 'items'), {
    ...data,
    imageUrl: null,
    imagePath: null,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

export const getItems = async (filters = {}) => {
  let q = collection(db, 'items');
  const constraints = [orderBy('createdAt', 'desc')];

  if (filters.status) constraints.push(where('status', '==', filters.status));
  if (filters.type) constraints.push(where('type', '==', filters.type));
  if (filters.category) constraints.push(where('category', '==', filters.category));

  const snap = await getDocs(query(q, ...constraints));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getItem = async (id) => {
  const snap = await getDoc(doc(db, 'items', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateItem = (id, data) =>
  updateDoc(doc(db, 'items', id), { ...data, updatedAt: serverTimestamp() });

export const deleteItem = async (id, imagePath) => {
  await deleteDoc(doc(db, 'items', id));
  if (imagePath) {
    try { await deleteObject(ref(storage, imagePath)); } catch (_) {}
  }
};

// ─── Claims ───────────────────────────────────────────────────────────────────

export const createClaim = async (itemId, userId, message) => {
  return addDoc(collection(db, 'claims'), {
    itemId,
    userId,
    message,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

export const getClaimsForItem = async (itemId) => {
  const snap = await getDocs(
    query(collection(db, 'claims'), where('itemId', '==', itemId))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
