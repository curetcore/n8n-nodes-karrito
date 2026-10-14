import type { INodeProperties } from 'n8n-workflow';
import { getManyFields, idField, unwrapData } from '../shared/descriptions';

const R = 'customer';

export const customerDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [R] } },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a customer',
				description: 'Retrieve a customer and their order count',
				routing: { request: { method: 'GET', url: '=/customers/{{$parameter.id}}' }, output: unwrapData },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many customers',
				description: 'Retrieve a list of customers',
				routing: { request: { method: 'GET', url: '/customers' }, output: unwrapData },
			},
		],
		default: 'getAll',
	},
	idField(R, ['get'], 'Customer ID'),
	...getManyFields(R),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: { show: { resource: [R], operation: ['getAll'] } },
		default: {},
		options: [
			{
				displayName: 'Search',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Search by name, phone or email',
				routing: { send: { type: 'query', property: 'q' } },
			},
		],
	},
];
