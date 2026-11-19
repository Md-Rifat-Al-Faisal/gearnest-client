/**
 * Uploads an image file to ImgBB and returns the hosted direct image URL.
 */
export async function uploadImageToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY
  if (!apiKey) {
    throw new Error("ImgBB API key is not configured. Please set NEXT_PUBLIC_IMGBB_API_KEY.")
  }

  const formData = new FormData()
  formData.append("image", file)

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`ImgBB upload request failed with HTTP ${res.status}`)
  }

  const data = await res.json()
  if (!data.success || !data.data?.url) {
    throw new Error(data.error?.message || "Failed to parse uploaded image URL from ImgBB")
  }

  return data.data.url
}
