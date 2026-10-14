import type { INodeProperties } from 'n8n-workflow';
import { unwrapData } from '../shared/descriptions';

const R = 'store';

export const storeDescription: INodeProperties[] = [
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
				action: 'Get the store',
				description: 'Retrieve the store name, currency, contact and status',
				routing: { request: { method: 'GET', url: '/store' }, output: unwrapData },
			},
			{
				name: 'Get Stats',
				value: 'getStats',
				action: 'Get store stats',
				description: 'Retrieve sales and catalog figures for the store',
				routing: { request: { method: 'GET', url: '/stats' }, output: unwrapData },
			},
		],
		default: 'get',
	},
];
