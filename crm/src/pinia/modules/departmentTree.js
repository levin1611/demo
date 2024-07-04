import { defineStore } from 'pinia';
import {getDepartmentDataTree, getDepartmentFewDataTree} from '@/api/department.js';
import { flattenObjectArray } from '@/utils/dataProcess.js';
import { useUserStore } from '@/pinia/modules/user.js';

const store = useUserStore();

export function extend(origin, needMember, parentOrigin) {
    // false  浅拷贝
    let obj = {};
    // 数组对象
    if (origin instanceof Array) {
        // 数组  obj 就得是数组
        obj = [];
    }
    // if (origin !== null && typeof origin === 'object' && origin.infoType == 1 ) return;
    if (parentOrigin) {
        // 添加一个searchname 用来实现树的模糊搜索
        let parent = parentOrigin.asearchName || parentOrigin.name || origin.name;
        if (origin instanceof Array) {
            origin.asearchName = parent;
        } else {
            origin.asearchName = `${parent}_${origin.name}`;
        }
    }

    for (let key in origin) {
        let value = origin[key];
        if (typeof value === 'object' && value !== null) {
            // 如果是对象 并且 对象的key是list 或者 value不是数组 才递归添加searchname属性
            // if ( key != 'list' ) {
            obj[key] = extend(value, needMember, origin);
            // } else {
            //     obj[key] = extend(value, needMember);
            // }
        } else {
            obj[key] = value;
        }
    }
    if (needMember) {
        // 是否需要返回成员
        // 返回的数据中 userList是成员的数据， list则是部门的数据 那就将 userlist添加到list后面组成全部的数据
        if (obj.userList && obj.userList.length) {
            obj.list = obj.list.concat(obj.userList);
        }
        if (obj instanceof Array) {
            obj = obj.filter(ele => ele != undefined);
        }

        if (obj.infoType == 0 && obj.count == 0) {
            // 是部门并且 成员数量为0 则直接禁用掉
            obj.disabled = true;
        }
    }
   
    
    return obj;
}


export const useDepartmentTree = defineStore('departmentTree', {
    state: () => {
        return {
            SourceWidthMembers: [], // 部门树的🐩量数据
            SourceWidthOutMembers: [] // 没有成员的数据
        };
    },
    getters: {
        treeDataSourceFloatMap: (state) => {
            return flattenObjectArray(state.SourceWidthMembers, 'list'); // 数组扁平一下 
        },
     
        treeSourceFloatMapWidthOutMembers: (state) => {
            return flattenObjectArray(state.SourceWidthOutMembers, 'list'); // 数组扁平一下
        }
    
    },
    actions: {
        async apiForGetData(params = {
            'userId': store.userId,
            'orgId': store.orgId
            // 'userFlag': false // 	获取部门树的时候是否需要成员信息
            // 'selectRoleId': 1, 	选中的用户ID
            // 'selectUserGroupId': 4, 选中的用户组ID
            // 'selectUserId': [36] 选中的用户ID
        }) {
            // 请求数据
            let response = await getDepartmentDataTree(params);
            if ( response.code === 10000) {
                const copy = JSON.stringify(response.data);
                this.SourceWidthMembers = extend(JSON.parse(copy), true);
                this.SourceWidthOutMembers = extend(JSON.parse(copy), false);
                // console.log(this.SourceWidthMembers, this.SourceWidthOutMembers, '深拷贝的对象的值');
            } else {
                ElMessage(`查询部门树结构接口${response.messageShow}`);
            }
        }
    }
});