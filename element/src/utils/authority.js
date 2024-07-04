// 按钮权限判断
export const HANDLE_BUTTON_FUN = (id, arr) => {
    let disable = true;
    for (const item of arr) {
        if (id === item.permissionCode) {
            disable = false;
            break;
        }
    }
    return disable;
};
