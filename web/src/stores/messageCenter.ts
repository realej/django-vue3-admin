import {defineStore} from "pinia";
/**
 * Message Center
 */
export const messageCenterStore = defineStore('messageCenter', {
    state: () => ({
        // Unread message
        unread: 0
    }),
    actions: {
        async setUnread (number:any) {
           this.unread = number
        }
    },
});
