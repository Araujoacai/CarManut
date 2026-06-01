// ============================================================
// db.js — Firestore CRUD Helpers
// ============================================================
import { db } from '../firebase.js';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, orderBy, where,
  serverTimestamp, Timestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ---- Helpers de path ----
const vehiclesRef = (uid) => collection(db, 'users', uid, 'vehicles');
const vehicleRef  = (uid, vid) => doc(db, 'users', uid, 'vehicles', vid);
const servicesRef = (uid, vid) => collection(db, 'users', uid, 'vehicles', vid, 'services');
const serviceRef  = (uid, vid, sid) => doc(db, 'users', uid, 'vehicles', vid, 'services', sid);

// ============================================================
// VEHICLES
// ============================================================

export async function getVehicles(uid) {
  const snap = await getDocs(query(vehiclesRef(uid), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getVehicle(uid, vehicleId) {
  const snap = await getDoc(vehicleRef(uid, vehicleId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function addVehicle(uid, data) {
  const ref = await addDoc(vehiclesRef(uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateVehicle(uid, vehicleId, data) {
  await updateDoc(vehicleRef(uid, vehicleId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteVehicle(uid, vehicleId) {
  // Delete all services first
  const svcSnap = await getDocs(servicesRef(uid, vehicleId));
  await Promise.all(svcSnap.docs.map(d => deleteDoc(d.ref)));
  await deleteDoc(vehicleRef(uid, vehicleId));
}

export async function updateKm(uid, vehicleId, newKm) {
  await updateDoc(vehicleRef(uid, vehicleId), {
    currentKm: Number(newKm),
    updatedAt: serverTimestamp(),
  });
}

// ============================================================
// SERVICES
// ============================================================

export async function getServices(uid, vehicleId) {
  const snap = await getDocs(query(servicesRef(uid, vehicleId), orderBy('date', 'desc')));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
    };
  });
}

export async function addService(uid, vehicleId, data) {
  const ref = await addDoc(servicesRef(uid, vehicleId), {
    ...data,
    date: data.date instanceof Date ? Timestamp.fromDate(data.date) : data.date,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteService(uid, vehicleId, serviceId) {
  await deleteDoc(serviceRef(uid, vehicleId, serviceId));
}

// ============================================================
// CUSTOM INTERVALS (por veículo)
// ============================================================

const customIntervalsRef = (uid, vid) => collection(db, 'users', uid, 'vehicles', vid, 'customIntervals');
const customIntervalRef  = (uid, vid, itemId) => doc(db, 'users', uid, 'vehicles', vid, 'customIntervals', itemId);

export async function getCustomIntervals(uid, vehicleId) {
  const snap = await getDocs(customIntervalsRef(uid, vehicleId));
  const result = {};
  snap.docs.forEach(d => { result[d.id] = d.data(); });
  return result;
}

export async function setCustomInterval(uid, vehicleId, itemId, data) {
  const ref = customIntervalRef(uid, vehicleId, itemId);
  await updateDoc(ref, data).catch(() => addDoc(customIntervalsRef(uid, vehicleId), { id: itemId, ...data }));
}

// ============================================================
// Aggregate: Get last service per maintenance item
// Returns: { itemId: { km, date, serviceId } }
// ============================================================
export function buildLastServiceMap(services) {
  const map = {};
  // Services sorted descending by date
  for (const svc of services) {
    const parts = svc.parts || [];
    for (const partId of parts) {
      if (!map[partId]) {
        map[partId] = {
          km:        svc.km || 0,
          date:      svc.date,
          serviceId: svc.id,
          cost:      svc.cost,
        };
      }
    }
  }
  return map;
}
