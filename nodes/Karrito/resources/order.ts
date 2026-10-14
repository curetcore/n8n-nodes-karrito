import type { INodeProperties } from 'n8n-workflow';
import { getManyFields, idField, unwrapData } from '../shared/descriptions';

const R = 'order';

const simplifyOrder = {
	type: 'setKeyValue' as const,
	enabled: '={{$parameter.simplify}}',
	properties: {
		id: '={{$responseItem.id}}',
		orderNumber: '={{$responseItem.orderNumber}}',
		status: '={{$responseItem.status}}',
		total: '={{$responseItem.total}}',
		currency: '={{$responseItem.currency}}',
		customerName: '={{$responseItem.customer?.name ?? null}}',
		customerPhone: '={{$responseItem.customer?.phone ?? null}}',
		createdAt: '={{$responseItem.createdAt}}',
	},
};

export const orderDescription: INodeProperties[] = [
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
				action: 'Get an order',
				description: 'Retrieve an order with its items and customer',
				routing: {
					request: { method: 'GET', url: '=/orders/{{$parameter.id}}' },
					output: { postReceive: [...unwrapData!.postReceive!, simplifyOrder] },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many orders',
				description: 'Retrieve a list of orders, newest first',
				routing: {
					request: { method: 'GET', url: '/orders' },
					output: { postReceive: [...unwrapData!.postReceive!, simplifyOrder] },
				},
			},
			{
				name: 'Update Notes',
				value: 'updateNotes',
				action: 'Update the internal notes of an order',
				description: 'Replace the internal notes of an order. Customers do not see them.',
				routing: {
					request: {
						method: 'PUT',
						url: '=/orders/{{$parameter.id}}/notes',
						body: { notes: '={{$parameter.notes}}' },
					},
					output: unwrapData,
				},
			},
			{
				name: 'Update Status',
				value: 'updateStatus',
				action: 'Update the status of an order',
				description: 'Mark an order as pending, completed or cancelled',
				routing: {
					request: {
						method: 'PUT',
						url: '=/orders/{{$parameter.id}}',
						body: { status: '={{$parameter.status}}' },
					},
					output: unwrapData,
				},
			},
		],
		default: 'getAll',
	},
	idField(R, ['get', 'updateNotes', 'updateStatus'], 'Order ID'),
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		displayOptions: { show: { resource: [R], operation: ['updateStatus'] } },
		options: [
			{ name: 'Cancelled', value: 'CANCELLED' },
			{ name: 'Completed', value: 'COMPLETED' },
			{ name: 'Pending', value: 'PENDING' },
		],
		default: 'COMPLETED',
		description:
			'Cancelling returns stock and discount uses, exactly as cancelling from the Karrito admin',
	},
	{
		displayName: 'Notes',
		name: 'notes',
		type: 'string',
		typeOptions: { rows: 3 },
		required: true,
		displayOptions: { show: { resource: [R], operation: ['updateNotes'] } },
		default: '',
		description: 'Replaces the current internal notes. Send an empty value to clear them.',
	},
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
				displayName: 'Include Test Orders',
				name: 'kind',
				type: 'options',
				options: [
					{ name: 'Real Orders Only', value: 'real' },
					{ name: 'Test Orders Only', value: 'test' },
					{ name: 'All Orders', value: 'all' },
				],
				default: 'real',
				description: 'Whether to include the test orders a merchant places to try the checkout',
				routing: { send: { type: 'query', property: 'kind' } },
			},
			{
				displayName: 'Search',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Order number, or customer name or phone',
				routing: { send: { type: 'query', property: 'q' } },
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Cancelled', value: 'CANCELLED' },
					{ name: 'Completed', value: 'COMPLETED' },
					{ name: 'Pending', value: 'PENDING' },
				],
				default: 'PENDING',
				routing: { send: { type: 'query', property: 'status' } },
			},
		],
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		displayOptions: { show: { resource: [R], operation: ['get', 'getAll'] } },
		default: true,
		description: 'Whether to return a simplified version of the response instead of the raw data',
	},
];
