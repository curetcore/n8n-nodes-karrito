import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { BASE_URL, storeSelect } from './shared/descriptions';
import { getStores } from './listSearch/getStores';
import { orderDescription } from './resources/order';
import { productDescription } from './resources/product';
import { customerDescription } from './resources/customer';
import { categoryDescription } from './resources/category';
import { discountDescription } from './resources/discount';
import { storeDescription } from './resources/store';

export class Karrito implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Karrito',
		name: 'karrito',
		icon: { light: 'file:../../icons/karrito.svg', dark: 'file:../../icons/karrito.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Manage orders, products, customers, categories and discounts in a Karrito store',
		defaults: { name: 'Karrito' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'karritoApi', required: true }],
		requestDefaults: {
			baseURL: BASE_URL,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'Karrito-Store': '={{$parameter.store?.value || $parameter.store || ""}}',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Category', value: 'category' },
					{ name: 'Customer', value: 'customer' },
					{ name: 'Discount', value: 'discount' },
					{ name: 'Order', value: 'order' },
					{ name: 'Product', value: 'product' },
					{ name: 'Store', value: 'store' },
				],
				default: 'order',
			},
			...orderDescription,
			...productDescription,
			...customerDescription,
			...categoryDescription,
			...discountDescription,
			...storeDescription,
			storeSelect,
		],
	};

	methods = {
		listSearch: { getStores },
	};
}
