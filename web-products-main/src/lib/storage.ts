export const PRODUCT_BUCKET = "product-images";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("No se pudo leer la imagen"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Error leyendo el archivo"));
    reader.readAsDataURL(file);
  });
}

export async function uploadProductImage(file: File): Promise<{ path: string; url: string }> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const url = await readFileAsDataURL(file);
  return { path, url };
}

export async function deleteProductImageByUrl(_url: string | null) {
  return;
}
