import type { INodeProperties } from 'n8n-workflow';
import { deletedOutput, getManyFields, idField, unwrapData } from '../shared/descriptions';

const R = 'product';

const simplifyProduct = {
	type: 'setKeyValue' as const,
	enabled: '={{$parameter.simplify}}',
	properties: {
		id: '={{$responseItem.id}}',
		name: '={{$responseItem.name}}',
		price: '={{$responseItem.price}}',
		comparePrice: '={{$responseItem.comparePrice}}',
		stock: '={{$responseItem.stock}}',
		isActive: '={{$responseItem.isActive}}',
		sku: '={{$responseItem.sku}}',
		imageUrl: '={{$responseItem.imageUrl}}',
	},
};

/** Optional fields shared by Create (Additional Fields) and Update (Update Fields). */
function productFields(name: string, displayName: string, operation: string): INodeProperties {
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
							displayName: 'Name',
							name: 'name',
							type: 'string' as const,
							default: '',
							routing: { send: { type: 'body' as const, property: 'name' } },
						},
						{
							displayName: 'Price',
							name: 'price',
							type: 'number' as const,
							typeOptions: { minValue: 0, numberPrecision: 2 },
							default: 0,
							description: 'Price in the store currency',
							routing: { send: { type: 'body' as const, property: 'price' } },
						},
					]
				: []),
			{
				displayName: 'Barcode',
				name: 'barcode',
				type: 'string',
				default: '',
				description: 'UPC, EAN or GTIN',
				routing: { send: { type: 'body', property: 'barcode' } },
			},
			{
				displayName: 'Category IDs',
				name: 'categoryIds',
				type: 'string',
				default: '',
				description: 'Comma-separated category IDs. Replaces the current categories.',
				routing: {
					send: {
						type: 'body',
						property: 'categoryIds',
						value: '={{ $value.split(",").map(v => v.trim()).filter(Boolean) }}',
					},
				},
			},
			{
				displayName: 'Compare-at Price',
				name: 'comparePrice',
				type: 'number',
				typeOptions: { minValue: 0, numberPrecision: 2 },
				default: 0,
				description: 'Original price shown struck through. Must be greater than the price.',
				routing: { send: { type: 'body', property: 'comparePrice' } },
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				routing: { send: { type: 'body', property: 'description' } },
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'imageUrl' } },
			},
			{
				displayName: 'Is Active',
				name: 'isActive',
				type: 'boolean',
				default: true,
				description: 'Whether the product shows in the public catalog',
				routing: { send: { type: 'body', property: 'isActive' } },
			},
			{
				displayName: 'SKU',
				name: 'sku',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'sku' } },
			},
			{
				displayName: 'Stock',
				name: 'stock',
				type: 'number',
				typeOptions: { minValue: 0 },
				default: 0,
				description: 'Units available. Leave this field out for unlimited stock.',
				routing: { send: { type: 'body', property: 'stock' } },
			},
		],
	};
}

export const productDescription: INodeProperties[] = [
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
				action: 'Create a product',
				description: 'Create a new product in the catalog',
				routing: { request: { method: 'POST', url: '/products' }, output: unwrapData },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a product',
				description: 'Remove a product from the catalog. Past orders keep their copy.',
				routing: {
					request: { method: 'DELETE', url: '=/products/{{$parameter.id}}' },
					output: deletedOutput,
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a product',
				description: 'Retrieve a product',
				routing: {
					request: { method: 'GET', url: '=/products/{{$parameter.id}}' },
					output: { postReceive: [...unwrapData!.postReceive!, simplifyProduct] },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many products',
				description: 'Retrieve a list of products',
				routing: {
					request: { method: 'GET', url: '/products' },
					output: { postReceive: [...unwrapData!.postReceive!, simplifyProduct] },
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a product',
				description: 'Update the fields you choose. Fields you leave out stay as they are.',
				routing: { request: { method: 'PUT', url: '=/products/{{$parameter.id}}' }, output: unwrapData },
			},
		],
		default: 'getAll',
	},
	idField(R, ['delete', 'get', 'update'], 'Product ID'),
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: [R], operation: ['create'] } },
		default: '',
		routing: { send: { type: 'body', property: 'name' } },
	},
	{
		displayName: 'Price',
		name: 'price',
		type: 'number',
		required: true,
		typeOptions: { minValue: 0, numberPrecision: 2 },
		displayOptions: { show: { resource: [R], operation: ['create'] } },
		default: 0,
		description: 'Price in the store currency',
		routing: { send: { type: 'body', property: 'price' } },
	},
	productFields('additionalFields', 'Additional Fields', 'create'),
	productFields('updateFields', 'Update Fields', 'update'),
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
				displayName: 'Barcode',
				name: 'barcode',
				type: 'string',
				default: '',
				description: 'Exact barcode match',
				routing: { send: { type: 'query', property: 'barcode' } },
			},
			{
				displayName: 'Search',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Search by name, SKU or barcode',
				routing: { send: { type: 'query', property: 'q' } },
			},
			{
				displayName: 'SKU',
				name: 'sku',
				type: 'string',
				default: '',
				description: 'Exact SKU match',
				routing: { send: { type: 'query', property: 'sku' } },
			},
			{
				displayName: 'Visibility',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'All', value: 'all' },
					{ name: 'Inactive', value: 'inactive' },
				],
				default: 'active',
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
