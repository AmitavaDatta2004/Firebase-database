const fs = require('fs');
const admin = require('firebase-admin');

// Load service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Recursively gets all documents + subcollections
 */
async function getCollectionData(collectionRef) {
  const snapshot = await collectionRef.get();
  const data = {};

  for (const doc of snapshot.docs) {
    const docData = doc.data();

    // Get subcollections for this document
    const subcollections = await doc.ref.listCollections();
    for (const sub of subcollections) {
      docData[sub.id] = await getCollectionData(sub);
    }

    data[doc.id] = docData;
  }

  return data;
}

async function exportFirestore() {
  const collections = await db.listCollections();

  for (const collection of collections) {
    const data = await getCollectionData(collection);
    const fileName = `${collection.id}.json`;

    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
    console.log(`✅ Exported ${collection.id} (with nested subcollections) → ${fileName}`);
  }
}

exportFirestore();
