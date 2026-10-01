import { useEffect, useState } from 'react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import {
  deleteFile,
  downloadFile,
  getBucketInfo,
  getFileUrl,
  listFiles,
  uploadFile,
} from './services/s3Service';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await listFiles();
      setFiles(data);
    } catch (err) {
      setError(err.message || 'Unable to list S3 files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please choose a file first.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      await uploadFile(selectedFile);
      setMessage(`Uploaded: ${selectedFile.name}`);
      setSelectedFile(null);
      await loadFiles();
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleView = (file) => {
    const url = getFileUrl(file.key);
    if (!url) {
      setError('File URL is not available.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async (file) => {
    try {
      setError('');
      await downloadFile(file.key);
      setMessage(`Downloaded: ${file.name}`);
    } catch (err) {
      setError(err.message || 'Download failed.');
    }
  };

  const handleDelete = async (file) => {
    const confirmed = window.confirm(`Delete ${file.name}?`);
    if (!confirmed) return;

    try {
      setError('');
      await deleteFile(file.key);
      setMessage(`Deleted: ${file.name}`);
      await loadFiles();
    } catch (err) {
      setError(err.message || 'Delete failed.');
    }
  };

  const bucketInfo = getBucketInfo();

  return (
    <div className="app-shell">
      <div className="app-card">
        <h1>React + AWS S3 File Manager</h1>

        {bucketInfo.bucketName ? (
          <p className="bucket-name">Bucket: {bucketInfo.bucketName}</p>
        ) : (
          <p className="warning">Set REACT_APP_S3_BUCKET and AWS credentials before using S3.</p>
        )}

        {message && <div className="status success">{message}</div>}
        {error && <div className="status error">{error}</div>}

        <FileUpload
          selectedFile={selectedFile}
          onFileChange={(event) => setSelectedFile(event.target.files[0] || null)}
          onUpload={handleUpload}
          uploading={uploading}
        />

        <button className="refresh-btn" onClick={loadFiles} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>

        <FileList
          files={files}
          loading={loading}
          onRefresh={loadFiles}
          onView={handleView}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default App;
