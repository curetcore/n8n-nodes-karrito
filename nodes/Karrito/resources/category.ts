import type { INodeProperties } from 'n8n-workflow';
import { deletedOutput, getManyFields, idField, unwrapData } from '../shared/descriptions';

const R = 'category';

function categoryFields(name: string, displayName: string, operation: string): INodeProperties {
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
					]
				: []),
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: { rows: 3 },
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
				description: 'Whether the category shows in the public catalog',
				routing: { send: { type: 'body', property: 'isActive' } },
			},
			{
				displayName: 'Position',
				name: 'position',
				type: 'number',
				typeOptions: { minValue: 0 },
				default: 0,
				description: 'Sort order. Lower numbers show first.',
				routing: { send: { type: 'body', property: 'position' } },
			},
		],
	};
}

export const categoryDescription: INodeProperties[] = [
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
				action: 'Create a category',
				description: 'Create a new category',
				routing: { request: { method: 'POST', url: '/categories' }, output: unwrapData },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a category',
				description: 'Delete a category. Its products stay in the catalog.',
				routing: {
					request: { method: 'DELETE', url: '=/categories/{{$parameter.id}}' },
					output: deletedOutput,
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a category',
				description: 'Retrieve a category',
				routing: { request: { method: 'GET', url: '=/categories/{{$parameter.id}}' }, output: unwrapData },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many categories',
				description: 'Retrieve a list of categories',
				routing: { request: { method: 'GET', url: '/categories' }, output: unwrapData },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a category',
				description: 'Update the fields you choose. Fields you leave out stay as they are.',
				routing: { request: { method: 'PUT', url: '=/categories/{{$parameter.id}}' }, output: unwrapData },
			},
		],
		default: 'getAll',
	},
	idField(R, ['delete', 'get', 'update'], 'Category ID'),
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: [R], operation: ['create'] } },
		default: '',
		routing: { send: { type: 'body', property: 'name' } },
	},
	categoryFields('additionalFields', 'Additional Fields', 'create'),
	categoryFields('updateFields', 'Update Fields', 'update'),
	...getManyFields(R),
];
