// lib/functions.ts
export const uploadWithProgress = (
    formData: FormData,
    onProgress: (percent: number) => void
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                onProgress(Math.round(percentComplete));
            }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const result = JSON.parse(xhr.responseText);
                    resolve(result);
                } catch (e) {
                    console.error('Failed to parse JSON:', xhr.responseText);
                    reject(new Error(`Invalid JSON response: ${xhr.responseText.substring(0, 100)}`));
                }
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
            }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
            reject(new Error('Network error - could not connect to server'));
        });

        xhr.addEventListener('abort', () => {
            reject(new Error('Upload cancelled'));
        });

        // Send request
        xhr.open('POST', 'http://localhost:8000/analyzer');
        xhr.send(formData);
    });
};