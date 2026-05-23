// importData.js - Run once to migrate all JSON data to Firestore
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Folder where your JSON files are stored
const dataDir = path.join(__dirname, 'server', 'data');

// List of collections to import (matches your filenames)
const collections = [
  'employees', 'leaves', 'attendance', 'expenses', 
  'recruitment', 'resumes', 'performance', 'payroll',
  'departments', 'announcements', 'chatbot'
];

async function importData() {
  for (const coll of collections) {
    const filePath = path.join(dataDir, `${coll}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${coll}.json not found, skipping`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data.length) {
      console.log(`📭 ${coll} is empty, skipping`);
      continue;
    }
    console.log(`📥 Importing ${data.length} records into "${coll}"...`);
    
    // Use batch writes (max 500 per batch)
    const batch = db.batch();
    let operationCount = 0;
    for (const item of data) {
      // Ensure each doc has an ID (use existing id field)
      const docId = item.id ? String(item.id) : `${coll}_${Date.now()}_${operationCount}`;
      const docRef = db.collection(coll).doc(docId);
      batch.set(docRef, item);
      operationCount++;
      
      // Commit every 500 operations
      if (operationCount === 500) {
        await batch.commit();
        // Start new batch
        operationCount = 0;
      }
    }
    if (operationCount > 0) {
      await batch.commit();
    }
    console.log(`✅ Imported ${data.length} records into "${coll}"`);
  }
  console.log('🎉 All data imported successfully!');
  process.exit(0);
}

importData().catch(err => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});