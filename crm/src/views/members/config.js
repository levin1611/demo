import { t } from '@/locale';
import {reactive} from 'vue';
export const clounData = [
    {
        key: 'selection',
        dataKey: 'selection',
        width: 50
        // cellRenderer: ({ rowData }) => {
        //     return '<ElCheckbox value={rowData.checked} />';
        // }
    },
    {
        title: t('departmentAndMember.tableId'),
        key: 'id',
        dataKey: 'id',
        width: 100
    },
    {
        title: t('departmentAndMember.cnName'),
        key: 'cnName',
        dataKey: 'cnName',
        width: 100
    },
    {
        title: t('departmentAndMember.enName'),
        key: 'enName',
        dataKey: 'enName',
        width: 100
    },
    {
        title: '授权角色',
        key: 'roles',
        dataKey: 'roles',
        width: 100
    },
    {
        title: t('departmentAndMember.email'),
        key: 'email',
        dataKey: 'email',
        width: 180
    },
    {
        title: t('departmentAndMember.mobile'),
        key: 'mobile',
        dataKey: 'mobile',
        width: 120
    },
    {
        title: t('departmentAndMember.jobTitle'),
        key: 'jobTitle',
        dataKey: 'jobTitleName',
        width: 100
    },
    {
        title: t('departmentAndMember.jobLevel'),
        key: 'jobLevel',
        dataKey: 'jobLevelName',
        width: 100
    },

    {
        title: t('departmentAndMember.employeeNo'),
        key: 'employeeNo',
        dataKey: 'employeeNo',
        width: 100
    },
    {
        title: t('departmentAndMember.directLeaders'),
        key: 'directLeaders',
        dataKey: 'directLeaders',
        width: 100
    },


    {
        title: t('departmentAndMember.department'),
        key: 'department',
        dataKey: 'department',
        width: 160
    }, 
    {
        title: t('departmentAndMember.relationDept'),
        key: 'relationDept',
        dataKey: 'relationDept',
        width: 100
    },
    {
        title: t('departmentAndMember.managerDept'),
        key: 'managerDept',
        dataKey: 'managerDept',
        width: 100
    },
    {
        title: 'QQ/MSN',
        key: 'im',
        dataKey: 'im',
        width: 100
    },
    {
        title: '企业微信',
        key: 'weChat',
        dataKey: 'weChat',
        width: 100
    },
    {
        title: '微博',
        key: 'weibo',
        dataKey: 'weibo',
        width: 100
    },
    // {
    //     title: '币种',
    //     key: 'currencyName',
    //     dataKey: 'currencyName',
    //     width: 100
    // },
    {
        title: t('departmentAndMember.gender'),
        key: 'gender',
        dataKey: 'gender',
        width: 100
    },
    {
        title: t('departmentAndMember.deleteFlag'),
        key: 'deleteFlag', // 0 启用 1禁用 2 离职
        dataKey: 'deleteFlag',
        width: 100
    },
    {
        title: t('departmentAndMember.activeStatus'),
        key: 'activeStatus', 
        dataKey: 'activeStatus',
        width: 100
    },
    {
        title: '入职日期',
        key: 'joinTime',
        dataKey: 'joinTime',
        width: 100
    },
    {
        title: '出生日期',
        key: 'userBirthday',
        dataKey: 'userBirthday',
        width: 100
    },
    {
        title: t('departmentAndMember.remark'),
        key: 'remark',
        dataKey: 'remark',
        width: 100
    },
    {
        title: t('departmentAndMember.createTime'),
        key: 'createTime',
        dataKey: 'createTime',
        width: 160
    },
    {
        title: t('departmentAndMember.updateTime'),
        key: 'updateTime',
        dataKey: 'updateTime',
        width: 160
    }
   
   
    // 新增字段
    // {
    //     title: '语言编码',
    //     key: 'languageCode',
    //     dataKey: 'languageCode',
    //     width: 100
    // },
    // {
    //     title: '时区',
    //     key: 'timezone',
    //     dataKey: 'timezone',
    //     width: 100
    // },
    
    // {
    //     title: 'Swift号',
    //     key: 'swift',
    //     dataKey: 'swift',
    //     width: 100
    // },
    
];
