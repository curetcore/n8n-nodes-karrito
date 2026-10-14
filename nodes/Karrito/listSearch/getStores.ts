import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
import { karritoApiRequest } from '../shared/transport';

type Store = { id: string; name: string; slug?: string };

export async function getStores(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const response = (await karritoApiRequest.call(this, 'GET', '/stores')) as { data: Store[] };
	const term = (filter ?? '').toLowerCase();
	return {
		results: response.data
			.filter((store) => !term || `${store.name} ${store.slug ?? ''}`.toLowerCase().includes(term))
			.map((store) => ({ name: store.name, value: store.id })),
	};
}
