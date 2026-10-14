import {
	NodeConnectionTypes,
	type IDataObject,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type IPollFunctions,
} from 'n8n-workflow';
import { storeSelect } from '../Karrito/shared/descriptions';
import { getStores } from '../Karrito/listSearch/getStores';
import { karritoApiRequest } from '../Karrito/shared/transport';

type Order = IDataObject & { orderNumber: number };

export class KarritoTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Karrito Trigger',
		name: 'karritoTrigger',
		icon: { light: 'file:../../icons/karrito.svg', dark: 'file:../../icons/karrito.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: 'On new order',
		description: 'Starts the workflow when a Karrito store receives a new order',
		defaults: { name: 'Karrito Trigger' },
		polling: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'karritoApi', required: true }],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'New Order',
						value: 'newOrder',
						description: 'Triggers once for every new order. Test orders are skipped.',
					},
				],
				default: 'newOrder',
			},
			storeSelect,
		],
	};

	methods = {
		listSearch: { getStores },
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const state = this.getWorkflowStaticData('node') as { lastOrderNumber?: number };
		const storeId = this.getNodeParameter('store', '', { extractValue: true }) as string;

		const response = (await karritoApiRequest.call(
			this,
			'GET',
			'/orders',
			{ kind: 'real', limit: 100, offset: 0 },
			storeId,
		)) as { data: Order[] };
		const orders = response.data;

		// Manual test run: show the latest order so the user can map its fields.
		if (this.getMode() === 'manual') {
			return orders.length ? [this.helpers.returnJsonArray([orders[0]])] : null;
		}

		const newest = orders.reduce((max, order) => Math.max(max, order.orderNumber), 0);

		// First activation only remembers where we are; it never replays old orders.
		if (state.lastOrderNumber === undefined) {
			state.lastOrderNumber = newest;
			return null;
		}

		const fresh = orders
			.filter((order) => order.orderNumber > (state.lastOrderNumber as number))
			.sort((a, b) => a.orderNumber - b.orderNumber);
		if (!fresh.length) return null;

		state.lastOrderNumber = newest;
		return [this.helpers.returnJsonArray(fresh)];
	}
}
