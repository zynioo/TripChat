import { defineStore } from 'pinia';


const useAuthStore = defineStore('auth', {
    state: () => ({
        authUser:null,
        isCheckingAuth:false,
    }),
});

export default useAuthStore;