import type { INodeProperties } from 'n8n-workflow';
import { deletedOutput, getManyFields, idField, unwrapData } from '../shared/descriptions';

const R = 'discount';

function discountFields(name: string, displayName: string, operation: string): INodeProperties {
	return {
		displayName,
		name,
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: { show: { resource: [R], operation: [operation] } },
		default: {},
		options: [
			...(operation === 'update'
				? [
						{
							displayName: 'Code',
							name: 'code',
							type: 'string' as const,
							default: '',
							routing: { send: { type: 'body' as const, property: 'code' } },
						},
						{
							displayName: 'Type',
							name: 'type',
							type: 'options' as const,
							options: [
								{ name: 'Fixed Amount', value: 'FIXED' },
								{ name: 'Percentage', value: 'PERCENTAGE' },
							],
							default: 'PERCENTAGE',
							routing: { send: { type: 'body' as const, property: 'type' } },
						},
						{
							displayName: 'Value',
							name: 'value',
							type: 'number' as const,
							typeOptions: { minValue: 0, numberPrecision: 2 },
							default: 0,
							routing: { send: { type: 'body' as const, property: 'value' } },
						},
					]
				: []),
			{
				displayName: 'Expires At',
				name: 'expiresAt',
				type: 'dateTime',
				default: '',
				routing: { send: { type: 'body', property: 'expiresAt' } },
			},
			{
				displayName: 'Is Active',
				name: 'isActive',
				type: 'boolean',
				default: true,
				description: 'Whether customers can use the code',
				routing: { send: { type: 'body', property: 'isActive' } },
			},
			{
				displayName: 'Max Uses',
				name: 'maxUses',
				type: 'number',
				typeOptions: { minValue: 0 },
				default: 0,
				description: 'How many times the code can be used in total',
				routing: { send: { type: 'body', property: 'maxUses' } },
			},
			{
				displayName: 'Minimum Order Amount',
				name: 'minOrderAmount',
				type: 'number',
				typeOptions: { minValue: 0, numberPrecision: 2 },
				default: 0,
				routing: { send: { type: 'body', property: 'minOrderAmount' } },
			},
			{
				displayName: 'Show in Store',
				name: 'publicoEnTienda',
				type: 'boolean',
				default: false,
				description: 'Whether to show the code to shoppers in the storefront',
				routing: { send: { type: 'body', property: 'publicoEnTienda' } },
			},
			{
				displayName: 'Starts At',
				name: 'startsAt',
				type: 'dateTime',
				default: '',
				routing: { send: { type: 'body', property: 'startsAt' } },
			},
		],
	};
}

export const discountDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [R] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a discount',
				description: 'Create a new discount code',
				routing: { request: { method: 'POST', url: '/discounts' }, output: unwrapData },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a discount',
				description: 'Delete a discount code',
				routing: {
					request: { method: 'DELETE', url: '=/discounts/{{$parameter.id}}' },
					output: deletedOutput,
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a discount',
				description: 'Retrieve a discount code',
				routing: { request: { method: 'GET', url: '=/discounts/{{$parameter.id}}' }, output: unwrapData },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many discounts',
				description: 'Retrieve a list of discount codes',
				routing: { request: { method: 'GET', url: '/discounts' }, output: unwrapData },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a discount',
				description: 'Update the fields you choose. Fields you leave out stay as they are.',
				routing: { request: { method: 'PUT', url: '=/discounts/{{$parameter.id}}' }, output: unwrapData },
			},
		],
		default: 'getAll',
	},
	idField(R, ['delete', 'get', 'update'], 'Discount ID'),
	{
		displayName: 'Code',
		name: 'code',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: [R], operation: ['create'] } },
		default: '',
		placeholder: 'e.g. SUMMER20',
		routing: { send: { type: 'body', property: 'code' } },
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		required: true,
		displayOptions: { show: { resource: [R], operation: ['create'] } },
		options: [
			{ name: 'Fixed Amount', value: 'FIXED' },
			{ name: 'Percentage', value: 'PERCENTAGE' },
		],
		default: 'PERCENTAGE',
		routing: { send: { type: 'body', property: 'type' } },
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'number',
		required: true,
		typeOptions: { minValue: 0, numberPrecision: 2 },
		displayOptions: { show: { resource: [R], operation: ['create'] } },
		default: 10,
		description: 'Percentage (0-100) or fixed amount in the store currency',
		routing: { send: { type: 'body', property: 'value' } },
	},
	discountFields('additionalFields', 'Additional Fields', 'create'),
	discountFields('updateFields', 'Update Fields', 'update'),
	...getManyFields(R),
];
