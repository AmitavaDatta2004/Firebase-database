const fs = require('fs');
const admin = require('firebase-admin');

// Load service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportFirestore() {
  const allData = {};
  const collections = await db.listCollections();

  for (const collection of collections) {
    const snapshot = await collection.get();
    allData[collection.id] = {};

    snapshot.forEach(doc => {
      allData[collection.id][doc.id] = doc.data();
    });
  }

  fs.writeFileSync('firestore-export.json', JSON.stringify(allData, null, 2));
  console.log('✅ Firestore data exported to firestore-export.json');
}

exportFirestore();
