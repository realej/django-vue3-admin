/**Role List Data Type */
export interface RoleItemType {
	id: string | number;
	modifier_name: string;
	creator_name: string;
	create_datetime: string;
	update_datetime: string;
	description: string;
	modifier: string;
	dept_belong_id: string;
	name: string;
	key: string;
	sort: number;
	status: boolean;
	admin: boolean;
	creator: string;
}

export interface UsersType {
	id: string | number;
	name: string;
}
export interface RoleUsersType {
	all_users: UsersType[];
	right_users: UsersType[];
}

/**
 * Permission configuration Drawer component parameter data type
 */
export interface RoleDrawerType {
	/** Whether to display the drawer*/
	drawerVisible: boolean;
	/** Roleid*/
	roleId: string | number | undefined;
	/** Role name*/
	roleName: string | undefined;
	/** user*/
	users: UsersType[];
}

/**
 * Menu Data Type
 */
export interface RoleMenuTreeType {
	id: number | string | undefined;
	/** Parentid */
	parent: number | string | undefined;
	name: string;
	/** Whether to select */
	isCheck: boolean;
	/** Is it a directory or not */
	is_catalog: boolean;
}
/**
 * menu-Button data type
 */
export interface RoleMenuBtnType {
	id: string | number;
	menu_btn_pre_id: string | number;
	/** Whether to select */
	isCheck: boolean;
	/** Button name */
	name: string;
	/** Data permission range */
	data_range: number | null;
	/** Custom Department */
	dept: number[];
}

/**
 * menu-Column field data type
 */
export interface RoleMenuFieldType {
	id: string | number | boolean;
	/** Model table field name */
	field_name: string;
	/** Field display name	*/
	title: string;
	/** Is it possible to query */
	is_query: boolean;
	/** Is it possible to create */
	is_create: boolean;
	/** Is it updating possible */
	is_update: boolean;
	[key: string]: string | number | boolean;
}
/**
 * menu-Column fields-Title data type
 */
export interface RoleMenuFieldHeaderType {
	value: string;
	/** Model table field name */
	label: string;
	/** Field display name	*/
	disabled: string;
	/** Is it possible to query */
	checked: boolean;
}
