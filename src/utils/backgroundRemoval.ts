/* ============================================
   LumiStrip — Background Removal
   Runs fully client-side (WASM/ONNX) — no photo
   ever leaves the browser. First run downloads the
   model (~cached after), so this can take a few
   seconds the first time it's used in a session.
   ============================================ */

export async function removeImageBackground(dataUrl: string): Promise<string | null> {
  try {
    const { removeBackground } = await import('@imgly/background-removal');
    const blob = await removeBackground(dataUrl, {
      model: 'isnet_quint8',
      output: { format: 'image/png', quality: 0.9 },
    });
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Could not read processed image'));
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Background removal failed', err);
    return null;
  }
}
