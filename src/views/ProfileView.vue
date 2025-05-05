<template>
  <div class="h-screen pt-20">
    <div class="max-w-2xl mx-auto p-4 py-8">
      <div class="bg-base-300 rounded-xl p-6 space-y-8">
        <div class="text-center">
          <h1 class="text-2xl font-semibold">Profile</h1>
          <p class="mt-2">Your profile information</p>
        </div>

        <!-- avatar upload section -->
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <img
              :src="selectedImg || authUser?.profilePicture || '/avatar.jpg'"
              alt="Profile"
              class="size-32 rounded-full object-cover border-4"
            />
            <label
              for="avatar-upload"
              :class="`
                absolute bottom-0 right-0 
                bg-base-content hover:scale-105
                p-2 rounded-full cursor-pointer 
                transition-all duration-200
                ${isUpdatingProfile ? 'animate-pulse pointer-events-none' : ''}
              `"
            >
              <Camera class="w-5 h-5 text-base-200" />
              <input
                type="file"
                id="avatar-upload"
                class="hidden"
                accept="image/*"
                @change="handleImageUpload"
                :disabled="isUpdatingProfile"
              />
            </label>
          </div>
          <p class="text-sm text-zinc-400">
            {{ isUpdatingProfile ? 'Uploading...' : 'Click the camera icon to update your photo' }}
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Basic Information Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- First Name -->
            <div class="space-y-1.5">
              <label class="text-sm text-zinc-400 flex items-center gap-2">
                <User class="w-4 h-4" />
                First Name
              </label>
              <input
                type="text"
                class="input input-bordered w-full"
                v-model="profileData.name"
                required
              />
            </div>

            <!-- Last Name -->
            <div class="space-y-1.5">
              <label class="text-sm text-zinc-400 flex items-center gap-2">
                <User class="w-4 h-4" />
                Last Name
              </label>
              <input
                type="text"
                class="input input-bordered w-full"
                v-model="profileData.lastName"
                required
              />
            </div>

            <!-- Username -->
            <div class="space-y-1.5">
              <label class="text-sm text-zinc-400 flex items-center gap-2">
                <AtSign class="w-4 h-4" />
                Username
              </label>
              <input
                type="text"
                class="input input-bordered w-full"
                v-model="profileData.username"
                required
              />
            </div>

            <!-- Date of Birth -->
            <div class="space-y-1.5">
              <label class="text-sm text-zinc-400 flex items-center gap-2">
                <Calendar class="w-4 h-4" />
                Date of Birth
              </label>
              <input
                type="date"
                class="input input-bordered w-full"
                v-model="profileData.dateOfBirth"
                required
              />
            </div>

            <!-- Email Address (Read-only) -->
            <div class="space-y-1.5 md:col-span-2">
              <label class="text-sm text-zinc-400 flex items-center gap-2">
                <Mail class="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                class="input input-bordered w-full bg-base-200"
                :value="authUser?.email"
                disabled
              />
            </div>

            <!-- Bio -->
            <div class="space-y-1.5 md:col-span-2">
              <label class="text-sm text-zinc-400 flex items-center gap-2">
                <FileText class="w-4 h-4" />
                Bio
              </label>
              <textarea
                class="textarea textarea-bordered w-full"
                rows="3"
                placeholder="Tell us a bit about yourself"
                v-model="profileData.bio"
              ></textarea>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-center mt-6">
            <button type="submit" class="btn btn-primary" :disabled="isUpdatingProfile">
              <template v-if="isUpdatingProfile">
                <Loader2 class="size-4 animate-spin mr-2" />
                Updating...
              </template>
              <template v-else> Save Changes </template>
            </button>
          </div>
        </form>

        <div class="mt-6 bg-base-300 rounded-xl p-6">
          <h2 class="text-lg font-medium mb-4">Account Information</h2>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between py-2 border-b border-zinc-700">
              <span>Member Since</span>
              <span>{{ authUser?.createdAt?.split('T')[0] }}</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span>Account Status</span>
              <span class="text-green-500">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { AtSign, Calendar, Camera, FileText, Loader2, Mail, User } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'

const selectedImg = ref<string | null>(null)
const authStore = useAuthStore()
const { authUser, isUpdatingProfile } = storeToRefs(authStore)
const { updateProfile } = authStore

const profileData = reactive({
  name: '',
  lastName: '',
  username: '',
  dateOfBirth: '',
  bio: '',
  profilePicture: '',
})

onMounted(() => {
  if (authUser.value) {
    profileData.name = authUser.value.name || ''
    profileData.lastName = authUser.value.lastName || ''
    profileData.username = authUser.value.username || ''
    profileData.dateOfBirth = authUser.value.dateOfBirth
      ? new Date(authUser.value.dateOfBirth).toISOString().split('T')[0]
      : ''
    profileData.bio = authUser.value.bio || ''
    profileData.profilePicture = authUser.value.profilePicture || ''
  }
})

const handleImageUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Check file type and size
  if (!file.type.startsWith('image/')) {
    toast.error('Proszę wybrać plik graficzny')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error('Rozmiar obrazu powinien być mniejszy niż 5MB')
    return
  }

  try {
    // Show loading state but don't set the global isUpdatingProfile here
    const loadingToast = toast.loading('Przygotowanie obrazu...')

    const reader = new FileReader()
    reader.onload = () => {
      selectedImg.value = reader.result as string
      toast.dismiss(loadingToast)
      toast.success('Zdjęcie gotowe do zapisania')
    }
    reader.onerror = () => {
      toast.dismiss(loadingToast)
      toast.error('Błąd podczas wczytywania obrazu')
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('Error reading image file:', error)
    toast.error('Błąd podczas przetwarzania obrazu')
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    // Create a plain object with just the data we need
    const updateData = {
      name: profileData.name,
      lastName: profileData.lastName,
      username: profileData.username,
      dateOfBirth: profileData.dateOfBirth,
      bio: profileData.bio || '',
      profilePicture: selectedImg.value || undefined,
    }

    await updateProfile(updateData)
    selectedImg.value = null // Reset selected image after successful update
  } catch (error) {
    console.error('Error updating profile:', error)
  }
}

const validateForm = () => {
  if (!profileData.name.trim()) {
    toast.error('First name is required')
    return false
  }
  if (!profileData.lastName.trim()) {
    toast.error('Last name is required')
    return false
  }
  if (!profileData.username.trim()) {
    toast.error('Username is required')
    return false
  }
  if (profileData.username.length < 3) {
    toast.error('Username must be at least 3 characters')
    return false
  }
  if (!profileData.dateOfBirth) {
    toast.error('Date of birth is required')
    return false
  }
  return true
}
</script>

<style scoped></style>
