import { defineStore } from 'pinia'
import { ref, computed, markRaw } from 'vue' // Import markRaw to prevent reactivity issues
import axiosInstance from '@/lib/axios'
import { toast } from 'vue-sonner'
import { useAuthStore } from './authStore'

interface User {
  _id: string
  name: string
  lastName: string
  profilePicture?: string
  lastActivity?: string // Track when we last exchanged messages with this user
  hasUnread?: boolean // Track if there are unread messages
}

interface Message {
  _id: string
  senderId: string
  receiverId: string
  text?: string
  image?: string
  createdAt: string
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const users = ref<User[]>([])
  const selectedUser = ref<User | null>(null)
  const isUsersLoading = ref(false)
  const isMessagesLoading = ref(false)
  const unreadCounts = ref<Record<string, number>>({}) // Track unread count by user ID

  // Computed property to sort users by most recent activity
  const sortedUsers = computed(() => {
    return [...users.value].sort((a, b) => {
      // Put users with unread messages first
      if (a.hasUnread && !b.hasUnread) return -1
      if (!a.hasUnread && b.hasUnread) return 1

      // Then sort by last activity
      const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0
      const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0
      return bTime - aTime // Descending order (newest first)
    })
  })

  const getUsers = async () => {
    isUsersLoading.value = true
    try {
      const res = await axiosInstance.get('/messages/users')

      // Keep unread status when refreshing user list
      const usersWithMetadata = res.data.map((user: User) => {
        const existing = users.value.find((u) => u._id === user._id)
        return {
          ...user,
          hasUnread: existing?.hasUnread || false,
          lastActivity: existing?.lastActivity || user.lastActivity || null,
        }
      })

      users.value = usersWithMetadata

      // Also fetch last message timestamps for sorting
      await updateLastActivityTimestamps()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error loading users')
    } finally {
      isUsersLoading.value = false
    }
  }

  // New function to update conversation timestamps
  const updateLastActivityTimestamps = async () => {
    try {
      const res = await axiosInstance.get('/messages/last-activities')
      const activities = res.data

      // Update users with their last activity timestamps
      users.value = users.value.map((user) => {
        const activity = activities.find((a: any) => a.userId === user._id)
        return {
          ...user,
          lastActivity: activity?.timestamp || user.lastActivity,
        }
      })
    } catch (error) {
      console.error('Failed to fetch last activities:', error)
    }
  }

  const getMessages = async (userId: string) => {
    isMessagesLoading.value = true
    try {
      const res = await axiosInstance.get(`/messages/${userId}`)
      messages.value = res.data

      // Mark messages as read when opening a conversation
      if (selectedUser.value && selectedUser.value._id === userId) {
        markMessagesAsRead(userId)

        // Update UI to remove unread indicator
        users.value = users.value.map((user) => {
          if (user._id === userId) {
            return { ...user, hasUnread: false }
          }
          return user
        })

        unreadCounts.value[userId] = 0
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error loading messages')
    } finally {
      isMessagesLoading.value = false
    }
  }

  // New function to mark messages as read
  const markMessagesAsRead = async (userId: string) => {
    try {
      await axiosInstance.post(`/messages/read/${userId}`)
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
  }

  const sendMessage = async (messageData: { text?: string; image?: string }) => {
    if (!selectedUser.value) return

    try {
      // Simpler approach - send to server first
      const res = await axiosInstance.post(`/messages/send/${selectedUser.value._id}`, messageData)

      // Add message locally immediately after server response
      if (res.data && res.data._id) {
        // Add to local messages if not already present
        if (!messages.value.some((m) => m._id === res.data._id)) {
          messages.value = [...messages.value, res.data]
        }
      }
    } catch (error: any) {
      console.error('Error in sendMessage:', error)
      toast.error('Nie udało się wysłać wiadomości')
    }
  }

  // Track message IDs to prevent duplicates
  const lastSentMessageIds = new Set<string>()
  const processedMessageIds = new Set<string>()

  // Add a new function to delete messages
  const deleteMessage = async (messageId: string) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`)

      // Remove the message from the local state
      messages.value = messages.value.filter((msg) => msg._id !== messageId)

      toast.success('Wiadomość została usunięta')
    } catch (error: any) {
      console.error('Error deleting message:', error)
      toast.error(error.response?.data?.message || 'Błąd podczas usuwania wiadomości')
    }
  }

  const subscribeToMessages = () => {
    if (!selectedUser.value) return

    // Clean up existing listeners first
    unsubscribeFromMessages()

    const authStore = useAuthStore()
    const socket = authStore.socket
    const currentUserId = authStore.authUser?._id

    if (!socket) {
      console.warn('Socket not available - messages will not update in real-time')
      return
    }

    console.log('Subscribing to message events for user:', selectedUser.value._id)

    // Simpler event handler for new messages
    socket.on('newMessage', (newMessage) => {
      console.log('Received new message:', newMessage)

      // Only process messages from the selected user
      if (selectedUser.value && newMessage.senderId === selectedUser.value._id) {
        // Add message if not already in the list
        if (!messages.value.some((m) => m._id === newMessage._id)) {
          console.log('Adding new message to chat')
          messages.value = [...messages.value, newMessage]

          // Mark as read since we're viewing this chat
          markMessagesAsRead(newMessage.senderId)
        }
      } else {
        // Message from someone else - mark unread and notify
        if (newMessage.senderId) {
          markUserWithUnreadMessage(newMessage.senderId)

          // Show notification
          const sender = users.value.find((user) => user._id === newMessage.senderId)
          if (sender) {
            toast(`Nowa wiadomość od ${sender.name} ${sender.lastName}`)
          }
        }
      }
    })

    // Simpler message sent confirmation
    socket.on('messageSent', (message) => {
      console.log('Message sent confirmation:', message)

      // Make sure this message is for the current chat
      if (selectedUser.value && message.receiverId === selectedUser.value._id) {
        // Add to messages if not already there
        if (!messages.value.some((m) => m._id === message._id)) {
          messages.value = [...messages.value, message]
        }
      }
    })

    // Add handler for deleted messages
    socket.on('messageDeleted', ({ messageId }) => {
      console.log('Message deleted:', messageId)
      messages.value = messages.value.filter((msg) => msg._id !== messageId)
    })
  }

  // Helper to update user activity time
  const updateUserActivity = (userId: string, timestamp: string) => {
    users.value = users.value.map((user) => {
      if (user._id === userId) {
        return {
          ...user,
          lastActivity: timestamp,
        }
      }
      return user
    })
  }

  // Helper to mark a user as having unread messages
  const markUserWithUnreadMessage = (userId: string) => {
    // Increment unread count
    unreadCounts.value[userId] = (unreadCounts.value[userId] || 0) + 1

    // Update user's hasUnread status
    users.value = users.value.map((user) => {
      if (user._id === userId) {
        return { ...user, hasUnread: true }
      }
      return user
    })
  }

  const unsubscribeFromMessages = () => {
    const authStore = useAuthStore()
    const socket = authStore.socket

    if (!socket) return

    socket.off('newMessage')
    socket.off('messageSent')
    socket.off('messageDeleted') // Also unsubscribe from messageDeleted events
  }

  const setSelectedUser = (user: User | null) => {
    selectedUser.value = user

    if (!user) {
      messages.value = []
    } else {
      // Mark as read when selecting a user
      if (user.hasUnread) {
        markMessagesAsRead(user._id)

        // Update UI
        users.value = users.value.map((u) => {
          if (u._id === user._id) {
            return { ...u, hasUnread: false }
          }
          return u
        })

        unreadCounts.value[user._id] = 0
      }
    }
  }

  return {
    messages,
    users,
    sortedUsers, // Export the computed property
    selectedUser,
    unreadCounts, // Export unread counts
    isUsersLoading,
    isMessagesLoading,
    getUsers,
    getMessages,
    sendMessage,
    deleteMessage, // Export the new function
    subscribeToMessages,
    unsubscribeFromMessages,
    setSelectedUser,
    markMessagesAsRead,
  }
})
