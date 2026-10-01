export default function FileUpload({ selectedFile, onFileChange, onUpload, uploading }) {
  return (
    <div className="upload-row">
      <label className="file-picker">
        <input type="file" onChange={onFileChange} />
        <span>{selectedFile ? selectedFile.name : 'Choose File'}</span>
      </label>

      <button onClick={onUpload} disabled={!selectedFile || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
