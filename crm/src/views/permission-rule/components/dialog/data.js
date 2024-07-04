export const permissionTypeOptions = (t) => [
    { lable: t('permRule.permissionType.canLook'), value: 0 },
    { lable: t('permRule.permissionType.canEdit'), value: 1 },
    { lable: t('permRule.permissionType.canShare'), value: 2 }
    // { lable: t('permRule.permissionType.canTransfer'), value: 3 }
];

export const dataRangeOptions = (t) => [
    { lable: t('permRule.dataRange.department'), value: 0 },
    { lable: t('permRule.dataRange.childDepartment'), value: 1 }
];

export const emptyFormData = {
    entityKey: null,
    ruleName: '',
    description: null,
    ruleType: 0,
    fromScope1: {
        dataRange: 0,
        itemId: null
    },
    fromScope2: {
        criteriaLogic: null,
        relationType: 0,
        fieldList: []
    },
    toScope: {
        dataRange: 0,
        itemId: null
    },
    permissionType: 0,
    ruleStatus: 1
};
