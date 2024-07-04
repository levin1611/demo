<template>
    <div class="portal-set-table table edittable-table-height-con">
        <Table
            class="tabmain noBoxShadow-right noborder-table"
            :data="tableData"
            size="medium"
            highlight-current-row
            style="width: 100%"
        >
            <template>
                <TableColumn
                    :prop="tableProps.accountName"
                    :label="tableTitle.accountName"
                    width="200"
                    show-overflow-tooltip
                >
                </TableColumn>
                <TableColumn
                    :prop="tableProps.relevanceName"
                    :label="tableTitle.relevanceName"
                    width="200"
                    show-overflow-tooltip
                >
                    <template slot-scope="{ row }">
                        <span>{{
                            tableTitle.relevanceName === $t('portal_set.whatsAppAccount') ? `+${row.chatAccount}` : row[tableProps.relevanceName]
                        }}</span>
                    </template>
                </TableColumn>
                <TableColumn
                    :prop="tableProps.website"
                    :label="tableTitle.website"
                    width="200"
                    show-overflow-tooltip
                >
                </TableColumn>
                <TableColumn
                    :prop="tableProps.createUserName"
                    :label="tableTitle.createUserName"
                    width="180"
                    show-overflow-tooltip
                >
                </TableColumn>
                <TableColumn
                    :prop="tableProps.createTime"
                    :label="tableTitle.createTime"
                    width="200"
                    show-overflow-tooltip
                >
                    <template slot-scope="{ row }">
                        <span>{{
                            row.createTime | timeFormat('DateTime')
                        }}</span>
                    </template>
                </TableColumn>
                <TableColumn
                    :label="tableTitle.setting"
                    width="180"
                    show-overflow-tooltip
                >
                    <template slot-scope="{ row }">
                        <span
                            @click="editItem(row)"
                            class="_link_push _font_size12"
                            >{{ $t('portal_set.editMessenger') }}</span
                        >
                        <span
                            @click="deleteItem(row)"
                            class="_link_push _font_size12"
                            style="margin-left: 15px"
                            >{{ $t('portal_set.deleteMessenger') }}</span
                        >
                    </template>
                </TableColumn>
            </template>
        </Table>
    </div>
</template>

<script>
    import util from '@/libs/util';

    export default {
        name: 'BuriedTable',
        data() {
            return {

            };
        },
        props: [
            'tableData',
            'tableTitle',
            'tableProps',
            'editItem',
            'deleteItem'
        ]
    };
</script>
