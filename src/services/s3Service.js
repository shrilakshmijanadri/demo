const API_URL =
  process.env.REACT_APP_API_URL || '/api';

export const uploadFile = async (file) => {
  if (!file) {
    throw new Error('Please choose a file first.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/files/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Upload failed.');
  }

  return response.json();
};

export const listFiles = async () => {
  const response = await fetch(`${API_URL}/files`);

  if (!response.ok) {
    throw new Error('Failed to load files.');
  }

  return response.json();
};

export const getFileUrl = (key) => {
  if (!key) {
    return '';
  }

  return `${API_URL}/files/download/${encodeURIComponent(key)}`;
};

export const downloadFile = async (key) => {
  const response = await fetch(getFileUrl(key));

  if (!response.ok) {
    throw new Error('Download failed.');
  }

  const blob = await response.blob();

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = key.split('/').pop() || 'download';

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(link.href);

  return true;
};

export const deleteFile = async (key) => {
  const fileName = key.split('/').pop();

  const response = await fetch(
    `${API_URL}/files/${encodeURIComponent(fileName)}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Delete failed.');
  }

  return response.json();
};

export const getBucketInfo = () => ({
  bucketName: 's3-test-01-navaneeth',
  folder: 'eventsphere/',
  region: 'us-east-1',
});