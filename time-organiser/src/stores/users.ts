import type { User } from '@/utils/types';
import {defineStore} from 'pinia'
import {ref,computed} from 'vue'

export const useUserStore = defineStore('user', {
    state: ()=> ({
        profile: null as User | null,
        accessToken: null as string | null,
        refreshToken: localStorage.getItem('refreshToken')
    }),
    getters: {
        isAuthenticated: state => !! state.accessToken
        //isAdmin: state => {return state.profile?.role.valueOf("Admin")},
    },
    actions: {
        setProfile(profile: User) {
            this.profile = profile;
        },
        setAccessToken(token: string) {
			this.accessToken = token;
		},
		setRefreshToken(token: string) {
			this.refreshToken = token;

			localStorage.setItem("refreshToken", token);
		},
		async logout() {
			this.accessToken = null;
			this.profile = null;
			this.refreshToken = null;
			localStorage.removeItem("refreshToken");
		},
        async clearUserData(){
            this.accessToken=null;
            this.profile = null;
            this.refreshToken = null;
            localStorage.removeItem("refreshToken");
        }
    }
})
