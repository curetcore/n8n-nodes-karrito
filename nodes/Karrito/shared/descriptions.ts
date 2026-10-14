import type { INodeProperties, INodePropertyRouting } from 'n8n-workflow';

export const BASE_URL = 'https://karrito.app/api/v1';

/**
 * Every Karrito response wraps its payload in `data`. This runs on every page,
 * so 'Return All' paginates over already unwrapped items.
 */
export const unwrapData: INodePropertyRouting['output'] = {
	postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }],
};

/** Karrito returns `{ ok: true, id }` on delete; n8n UX asks for `{ deleted: true }`. */
export const deletedOutput: INodePropertyRouting['output'] = {
	postReceive: [{ type: 'set', properties: { value: '={{ { "deleted": true } }}' } }],
};

export const storeSelect: INodeProperties = {
	displayName: 'Store',
	name: 'store',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	description:
		'Only needed with an account API key that reaches several stores. A store API key always uses its own store.',
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a store...',
			typeOptions: { searchListMethod: 'getStores', searchable: true },
		},
		{
			displayName: 'By ID',
			name: 'id',
			type: 'string',
			placeholder: 'e.g. cm1a2b3c4d5e6f7g8h9i0',
		},
	],
};

/** `Return All` + `Limit` for list endpoints answering `{ data, total, limit, offset }`. */
export function getManyFields(resource: string): INodeProperties[] {
	const show = { resource: [resource], operation: ['getAll'] };
	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			displayOptions: { show },
			default: false,
			description: 'Whether to return all results or only up to a given limit',
			routing: {
				send: { paginate: '={{ $value }}' },
				operations: {
					pagination: {
						type: 'offset',
						properties: {
							limitParameter: 'limit',
							offsetParameter: 'offset',
							pageSize: 100,
							type: 'query',
						},
					},
				},
			},
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			displayOptions: { show: { ...show, returnAll: [false] } },
			typeOptions: { minValue: 1, maxValue: 100 },
			default: 50,
			description: 'Max number of results to return',
			routing: {
				send: { type: 'query', property: 'limit' },
				output: { maxResults: '={{$value}}' },
			},
		},
	];
}

/** A required ID text field shown for the given operations. */
export function idField(resource: string, operations: string[], displayName: string): INodeProperties {
	return {
		displayName,
		name: 'id',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: [resource], operation: operations } },
		description: `The ${displayName.toLowerCase()} as shown in Karrito`,
	};
}
