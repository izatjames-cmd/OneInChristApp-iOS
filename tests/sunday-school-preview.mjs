import { createServer } from 'vite'

// Local UI check with fake Firebase/device data; never connects to the church database.
const mocks = {
  '@capacitor-firebase/firestore': `
    const messages = [{ id: 'first', data: { uid: 'admin', name: 'Sunday School Admin', title: 'Sunday lesson', message: 'The lesson is ready for Sunday.', createdAt: '2026-09-15T12:00:00Z' } }];
    let listener;
    export const FirebaseFirestore = {
      getCollection: async ({ reference }) => ({ snapshots: reference === 'sundaySchoolGallery' ? [
        { id: 'legacy-photo', data: { title: 'Sunday School artwork', image: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180"><rect width="400" height="180" fill="#ecdab6"/><text x="35" y="95" fill="#403524" font-size="24">Sunday School artwork</text></svg>'), album: 'Special Events' } },
        { id: 'video', data: { title: 'Class video', mediaType: 'video', video: 'data:video/mp4;base64,AAAA', description: 'Video player check' } }
      ] : [] }),
      addCollectionSnapshotListener: async (options, callback) => { listener = callback; window.__chatSubscriptions = (window.__chatSubscriptions || 0) + 1; callback({ snapshots: messages }); return 'preview'; },
      removeSnapshotListener: async () => { listener = null; },
      setDocument: async ({ data }) => { window.__lastSaved = data; messages.push({ id: String(messages.length), data }); listener?.({ snapshots: messages }); }
    };
  `,
  '@capacitor-firebase/storage': `export const FirebaseStorage = {
    uploadFile: async (options, callback) => callback?.({ completed: true, progress: 1 }),
    getDownloadUrl: async () => ({ downloadUrl: 'https://example.com/preview.jpg' }),
    deleteFile: async () => {}
  };`,
  '@capawesome/capacitor-file-picker': `export const FilePicker = {
    pickImages: async () => ({ files: [{ name: 'photo.jpg', mimeType: 'image/jpeg', size: 20, blob: new Blob(['photo'], { type: 'image/jpeg' }) }] }),
    pickVideos: async () => ({ files: [{ name: 'video.mp4', mimeType: 'video/mp4', size: 20, blob: new Blob(['video'], { type: 'video/mp4' }) }] })
  };`
}

const server = await createServer({
  configFile: false,
  server: { host: '127.0.0.1', port: 5192, strictPort: true },
  plugins: [{
    name: 'sunday-school-test-boundaries',
    enforce: 'pre',
    resolveId(id) { if (id in mocks) return '\0ss-test:' + id },
    load(id) { if (id.startsWith('\0ss-test:')) return mocks[id.slice(9)] }
  }]
})
await server.listen()
console.log('Sunday School UI check: http://127.0.0.1:5192/tests/sunday-school-preview.html')
