export function formateType(val) {
    let title;
    switch (val) { 
        case 'Lead': 
            title = '转化线索时客户、联系人、商机是否为必填';
            break;
        case 'touchPointContact':  
            title = '';
            break;
    }
    return title;
}

export function formateUpdateTitle(val) {
    let title;
    switch (val) { 
        case 'lead': 
            title = '当线索关联已存在的客户/联系人后，客户、联系人字段的映射内容更新设置';
            break;
        case 'touchPointContact':  
            title = '当触点关联已存在的对象数据时，对象字段的映射内容更新设置';
            break;
    }
    console.log(title);

    return title;
}