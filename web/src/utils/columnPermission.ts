import XEUtils from 'xe-utils';
import {useColumnPermission} from '/@/stores/columnPermission';

type permissionType = 'is_create' | 'is_query' | 'is_update';

export const columnPermission = (key: string, type: permissionType): boolean => {
	const permissions = useColumnPermission().permission || [];

	return !!permissions.some((i) => i.field_name === key && i[type]);
};

/**
 * Process field information permissions
 * @param func Interface function to obtain field information
 * @param crudOptions OriginalcrudOptionsinformation
 * @param excludeColumn Columns that need to be excluded
 */
export const handleColumnPermission = async (func: Function, crudOptions: any,excludeColumn:string[]=[]) => {
	const res = await func();
	if(crudOptions.pagination==undefined){
		crudOptions['pagination'] = {
			show:true
		}
	}
	const columns = crudOptions.columns;
	const excludeColumns = ['checked','_index','id', 'create_datetime', 'update_datetime'].concat(excludeColumn)
	XEUtils.eachTree(columns, (item, key) => {
		if (!excludeColumns.includes(String(key)) && key in res.data) {
			// If the list is not visible，Then selecting in column settings is prohibited
			// Only the list is not visible，Modify column configuration，This will not affect the default configuration
			if (!res.data[key]['is_query']) {
				item.column.show = false;
				item.column.columnSetDisabled = true;
			}
			item.addForm = { show: res.data[key]['is_create'] };
			item.editForm = { show: res.data[key]['is_update'] };
		}
	});
	return crudOptions
}
