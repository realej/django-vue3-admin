import request from '/@/utils/request';

/**
 * Log inapiInterface collection
 * @method signIn User login
 * @method signOut User logout
 */
export function useLoginApi() {
	return {
		signIn: (params: object) => {
			return request({
				url: '/user/signIn',
				method: 'post',
				data: params,
			});
		},
		signOut: (params: object) => {
			return request({
				url: '/user/signOut',
				method: 'post',
				data: params,
			});
		},
	};
}
