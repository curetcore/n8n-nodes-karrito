import type {
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IPollFunctions,
} from 'n8n-workflow';
import { BASE_URL } from './descriptions';

export async function karritoApiRequest(
	this: ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	resource: string,
	qs: IDataObject = {},
	storeId = '',
) {
	const options: IHttpRequestOptions = {
		method,
		url: `${BASE_URL}${resource}`,
		qs,
		json: true,
		headers: storeId ? { 'Karrito-Store': storeId } : {},
	};
	return this.helpers.httpRequestWithAuthentication.call(this, 'karritoApi', options);
}
