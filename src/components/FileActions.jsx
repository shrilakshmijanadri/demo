export default function FileActions({ file, onView, onDownload, onDelete }) {
  const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name);

  return (
    <div className="actions">
      {isImage && (
        <button type="button" onClick={() => onView(file)}>
          View
        </button>
      )}
      <button type="button" onClick={() => onDownload(file)}>
        Download
      </button>
      <button type="button" className="danger" onClick={() => onDelete(file)}>
        Delete
      </button>
    </div>
  );
}
