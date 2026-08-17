// Unsigned upload straight from the browser -- no backend involved (this
// app deliberately has no server; see the WhatsApp checkout flow for the
// same reasoning). The cloud name and unsigned preset are meant to be
// public; Cloudinary enforces what an unsigned preset is allowed to do
// from its own dashboard settings, not by keeping these values secret.
const CLOUD_NAME = 'dut2dpxuc'
const UPLOAD_PRESET = 'Ay-Gadget'

export async function uploadToCloudinary(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: formData
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error?.message || 'Upload failed. Please try again.')
  }

  const data = await res.json()
  return data.secure_url
}
