import axios from "axios";
import * as process from "process";
import {Local, Session} from '/@/utils/storage';
import {ElNotification} from "element-plus";
import fs from "fs";

// Whether to display the upgrade prompt message box
const IS_SHOW_UPGRADE_SESSION_KEY = 'isShowUpgrade';
const VERSION_KEY = 'DVADMIN3_VERSION'
const VERSION_FILE_NAME = 'version-build'

export function showUpgrade  () {
    const isShowUpgrade = Session.get(IS_SHOW_UPGRADE_SESSION_KEY) ?? false
    if (isShowUpgrade) {
        Session.remove(IS_SHOW_UPGRADE_SESSION_KEY)
        ElNotification({
            title: 'New version upgrade',
            message: "New version of the system was detected，Updating！Don't worry，Updated very quickly！",
            type: 'success',
            duration: 5000,
        });
    }
}

// Production environment front-end version verification，
export async function checkVersion(){
    if (process.env.NODE_ENV === 'development') {
        // No need to verify the front-end version of the development environment
        return
    }
    // Get the online version number tFor timestamp，Prevent cache
    await axios.get(`${import.meta.env.VITE_PUBLIC_PATH}${VERSION_FILE_NAME}?t=${new Date().getTime()}`).then(res => {
        const {status, data} = res || {}
        if (status === 200) {
            // Get the current version number
            const localVersion = Local.get(VERSION_KEY)
            // Persistent cache of current version number to local
            Local.set(VERSION_KEY, data)
            // When the user has a version number locally and does not match the online version number，Perform page refresh operation
            if (localVersion && localVersion !== data) {
                // The local cache version number is inconsistent with the online version number，The upgrade prompt box pops up
                // This is not possible to use the message box to remind you directly，because window.location.reload()This will cause the message box to disappear,Will be inloadingPage to determine whether the upgrade prompt box needs to be displayed
                Session.set(IS_SHOW_UPGRADE_SESSION_KEY, true)
                window.location.reload()

            }
        }
    })
}

export function generateVersionFile (){
    // Generate version file topublicIn the directoryversionIn the file
    const version = `${process.env.npm_package_version}.${new Date().getTime()}`;
    fs.writeFileSync(`public/${VERSION_FILE_NAME}`, version);
}
