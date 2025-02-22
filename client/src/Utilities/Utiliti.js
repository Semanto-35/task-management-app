import axios from 'axios'


export const imageUpload = async (imageData) => {
  const formData = new FormData();
  formData.append('file', imageData);
  formData.append('upload_preset', 'user_photos');
  const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    formData
  )
  return data.secure_url;
}

export const saveUser = async (user) => {
  await axios.post(`${import.meta.env.VITE_API_URL}/users/${user?.email}`, {
    uId: user?.uid,
    name: user?.displayName,
    image: user?.photoURL,
    email: user?.email,
  })
}