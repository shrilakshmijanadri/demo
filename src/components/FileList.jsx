import FileActions from './FileActions';

const formatSize = (bytes) => {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString();
};

export default function FileList({ files, loading, onRefresh, onView, onDownload, onDelete }) {
  return (
    <div className="file-table-wrap">
      <div className="section-header">
        <h3>Files in S3</h3>
        <button onClick={onRefresh} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <p>Loading files...</p>
      ) : files.length === 0 ? (
        <p>No files found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Last Modified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.key}>
                <td>{file.name}</td>
                <td>{formatSize(file.size)}</td>
                <td>{formatDate(file.lastModified)}</td>
                <td>
                  <FileActions
                    file={file}
                    onView={onView}
                    onDownload={onDownload}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
