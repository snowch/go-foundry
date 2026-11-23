const database = 'go-foundry-workspace-v1';
let connection;
async function open() {
  if (!connection) connection = new Promise((resolve, reject) => {
    const request = indexedDB.open(database, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('snapshots');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).catch(error => { connection = null; throw error; });
  return connection;
}
export async function loadWorkspace() {
  const db = await open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('snapshots', 'readonly');
    const request = transaction.objectStore('snapshots').get('project');
    transaction.oncomplete = () => resolve(request.result);
    transaction.onabort = () => reject(transaction.error || Error('Project storage is unavailable.'));
  });
}
export async function saveWorkspace(bytes) {
  const db = await open(), savedAt = Date.now();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('snapshots', 'readwrite');
    transaction.objectStore('snapshots').put({bytes, savedAt}, 'project');
    transaction.oncomplete = () => resolve(savedAt);
    transaction.onabort = () => reject(transaction.error || Error('Project storage is full or unavailable.'));
    transaction.onerror = () => {}; // The transaction's abort is the failure boundary.
  });
}
// Used only by the explicit, confirmed recovery action. Editor drafts and results
// are separate and are never cleared here.
export async function clearWorkspace() {
  const db=await open();
  return new Promise((resolve,reject)=>{
    const transaction=db.transaction('snapshots','readwrite');
    transaction.objectStore('snapshots').delete('project');
    transaction.oncomplete=()=>resolve();
    transaction.onabort=()=>reject(transaction.error||Error('The saved project could not be cleared.'));
    transaction.onerror=()=>{};
  });
}
