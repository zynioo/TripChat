import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosInstance from '@/lib/axios'
import { io, Socket } from 'socket.io-client'
import { toast } from 'vue-sonner'

interface User {
  _id: string
  name: string
  lastName: string
  username: string
  dateOfBirth: string
  email: string
  profilePicture?: string
  bio?: string
  createdAt?: string
}

export const useAuthStore = defineStore('auth', () => {
  const authUser = ref<User | null>(null)
  const isSigningUp = ref(false)
  const isLoggingIn = ref(false)
  const isUpdatingProfile = ref(false)
  const isCheckingAuth = ref(true)
  const onlineUsers = ref<string[]>([])
  const socket = ref<Socket | null>(null)

  const BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '/'

  const checkAuth = async () => {
    isCheckingAuth.value = true
    try {
      const res = await axiosInstance.get('/auth/check')
      authUser.value = res.data
      connectSocket()
    } catch (error) {
      console.log('Error in checkAuth:', error)
      authUser.value = null
    } finally {
      isCheckingAuth.value = false
    }
  }

  const signup = async (data: any) => {
    isSigningUp.value = true
    try {
      const res = await axiosInstance.post('/auth/register', data)
      authUser.value = res.data.user
      toast.success('Account created successfully')
      connectSocket()
    } catch (error: any) {
      toast.error(error.response.data.message || 'Error signing up')
    } finally {
      isSigningUp.value = false
    }
  }

  const login = async (data: any) => {
    isLoggingIn.value = true
    try {
      const res = await axiosInstance.post('/auth/login', data)
      authUser.value = res.data.user
      toast.success('Logged in successfully')
      connectSocket()
    } catch (error: any) {
      toast.error(error.response.data.message || 'Error logging in')
    } finally {
      isLoggingIn.value = false
    }
  }

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout')
      authUser.value = null
      toast.success('Logged out successfully')
      disconnectSocket()
    } catch (error: any) {
      toast.error(error.response.data.message || 'Error logging out')
    }
  }

  const updateProfile = async (data: any) => {
    isUpdatingProfile.value = true
    const loadingToast = toast.loading('Aktualizacja profilu...')

    try {
      // Compress image if needed (and exists)
      let profilePicture = data.profilePicture

      if (profilePicture && typeof profilePicture === 'string' && profilePicture.length > 500000) {
        // Show compression message in the existing toast
        toast.loading('Kompresowanie zdjęcia...', { id: loadingToast })
        profilePicture = await compressImage(profilePicture)
      }

      // Create clean data object
      const updateData = {
        name: data.name,
        lastName: data.lastName,
        username: data.username,
        dateOfBirth: data.dateOfBirth,
        bio: data.bio || '',
        profilePicture,
      }

      // Use a longer timeout for uploads
      const res = await axiosInstance.put('/auth/update', updateData, {
        timeout: 60000, // 60 second timeout for larger uploads
      })

      // Update the auth user data
      authUser.value = res.data

      // Clear loading toast and show success
      toast.dismiss(loadingToast)
      toast.success('Profil zaktualizowany pomyślnie')
    } catch (error: any) {
      console.error('Profile update error:', error)

      // Clear loading toast and show error
      toast.dismiss(loadingToast)
      toast.error(error.response?.data?.message || 'Błąd podczas aktualizacji profilu')
    } finally {
      isUpdatingProfile.value = false
    }
  }

  // Helper function to compress images
  const compressImage = async (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        // Target dimensions - max 800px on largest dimension
        let width = img.width
        let height = img.height
        const maxSize = 800

        if (width > height && width > maxSize) {
          height = (height / width) * maxSize
          width = maxSize
        } else if (height > width && height > maxSize) {
          width = (width / height) * maxSize
          height = maxSize
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx!.drawImage(img, 0, 0, width, height)

        // Reduce quality for JPEG
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = dataUrl
    })
  }

  const connectSocket = () => {
    if (!authUser.value || socket.value?.connected) return

    const newSocket = io(BASE_URL, {
      query: {
        userId: authUser.value._id,
      },
      transports: ['websocket', 'polling'], // Explicitly specify transports
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    // Log connection status for debugging
    newSocket.on('connect', () => {
      console.log('Socket connected successfully')
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    socket.value = newSocket

    socket.value.on('getOnlineUsers', (userIds) => {
      onlineUsers.value = userIds
    })
  }

  const disconnectSocket = () => {
    if (socket.value?.connected) socket.value.disconnect()
  }

  // Computed property for displaying full name
  const fullName = computed(() => {
    if (!authUser.value) return ''
    return `${authUser.value.name} ${authUser.value.lastName}`
  })

  return {
    authUser,
    isSigningUp,
    isLoggingIn,
    isUpdatingProfile,
    isCheckingAuth,
    onlineUsers,
    socket,
    fullName,
    checkAuth,
    signup,
    login,
    logout,
    updateProfile,
    connectSocket,
    disconnectSocket,
  }
})
