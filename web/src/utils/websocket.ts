import {ElNotification  as message} from 'element-plus'
import {Session} from "/@/utils/storage";
import {getWsBaseURL} from "/@/utils/baseUrl";
// @ts-ignore
import socket from '@/types/api/socket'
import {useUserInfo} from "/@/stores/userInfo";
const websocket: socket = {
    websocket: null,
    connectURL: getWsBaseURL(),
    // Turn on the logo
    socket_open: false,
    // Heartbeattimer
    hearbeat_timer: null,
    // Heartbeat sending frequency
    hearbeat_interval: 2 * 1000,
    // Whether to reconnect automatically
    is_reonnect: true,
    // Number of reconnections
    reconnect_count: 3,
    // Number of repetitions initiated
    reconnect_current: 1,
    // Reconnecttimer
    reconnect_timer: null,
    // Reconnect frequency
    reconnect_interval: 5 * 1000,
    init: (receiveMessage: Function | null) => {
        if (!('WebSocket' in window)) {
            message.warning('The browser does not support itWebSocket')
            return null
        }
        const token = Session.get('token')
        if(!token){
            // message.warning('websocketAuthentication failed')
            return null
        }
        const wsUrl = `${getWsBaseURL()}ws/${token}/`
        websocket.websocket = new WebSocket(wsUrl)
        websocket.websocket.onmessage = (e: any) => {
            if (receiveMessage) {
                receiveMessage(e)
            }
        }
        websocket.websocket.onclose = (e: any) => {
            websocket.socket_open = false
            useUserInfo().setWebSocketState(websocket.socket_open);
            // Need to reconnect
            if (websocket.is_reonnect) {
                websocket.reconnect_timer = setTimeout(() => {
                    // More than the reconnection
                    if (websocket.reconnect_current > websocket.reconnect_count) {
                        clearTimeout(websocket.reconnect_timer)
                        websocket.is_reonnect = false
                        websocket.socket_open = false
                        useUserInfo().setWebSocketState(websocket.socket_open);
                        return
                    }
                    // Record the number of reconnections
                    websocket.reconnect_current++
                    websocket.reconnect()
                }, websocket.reconnect_interval)
            }
        }
        // Connection successfully
        websocket.websocket.onopen = function () {
            websocket.socket_open = true
            useUserInfo().setWebSocketState(websocket.socket_open);
            websocket.is_reonnect = true
            // Turn on heartbeat
            websocket.heartbeat()
        }
        // An error occurred in connection
        websocket.websocket.onerror = function () { }
    },
    heartbeat: () => {
        websocket.hearbeat_timer && clearInterval(websocket.hearbeat_timer)

        websocket.hearbeat_timer = setInterval(() => {
            let data = {
                token: Session.get('token')
            }
            websocket.send(data)
        }, websocket.hearbeat_interval)
    },
    send: (data:string, callback = null) => {
        // Direct sending on
        if (websocket.websocket.readyState === websocket.websocket.OPEN) {
            websocket.websocket.send(JSON.stringify(data))
            // @ts-ignore
            callback && callback()
        } else {
            clearInterval(websocket.hearbeat_timer)
            // message({
            //     type: 'warning',
            //     message: 'socketThe link has been disconnected',
            //     duration: 1000,
            // })
            websocket.socket_open = false
            useUserInfo().setWebSocketState(websocket.socket_open);
        }
    },
    close: () => {
        websocket.is_reonnect = false
        websocket.websocket.close()
        websocket.websocket = null;
        websocket.socket_open = false
        useUserInfo().setWebSocketState(websocket.socket_open);
    },
    /**
     * Reconnect
     */
    reconnect: () => {
        if (websocket.websocket && !websocket.is_reonnect) {
            websocket.close()
        }
        websocket.init(null)
    },
}
export default websocket;
