import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class KarritoApi implements ICredentialType {
	name = 'karritoApi';

	displayName = 'Karrito API';

	icon: Icon = { light: 'file:../icons/karrito.svg', dark: 'file:../icons/karrito.dark.svg' };

	documentationUrl = 'https://github.com/curetcore/n8n-nodes-karrito#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Create it in Karrito under Settings → Integrations → API keys. API keys are available on the Pro plan.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// Works for store keys (returns its own store) and account keys (returns every store it reaches).
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://karrito.app/api/v1',
			url: '/stores',
			method: 'GET',
		},
	};
}
