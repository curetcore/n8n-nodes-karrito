# n8n-nodes-karrito

n8n community nodes for [Karrito](https://karrito.app), the simplest online store with WhatsApp checkout.

- **Karrito** — work with orders, products, customers, categories, discounts and store data.
- **Karrito Trigger** — start a workflow when your store receives a new order.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [Example workflows](#example-workflows) · [Compatibility](#compatibility) · [Resources](#resources)

## Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) and install `n8n-nodes-karrito`.

## Credentials

The nodes use a Karrito API key.

1. In Karrito, open **Settings → Integrations → API keys**.
2. Create a key. Choose **Read** to only read data, or add **Write** to create and update.
3. In n8n, create a **Karrito API** credential and paste the key.

API keys are available on the Karrito **Pro** plan. A store key works on its own store. An account key can reach several stores; pick one in the node's **Store** field.

## Operations

| Resource | Operations |
|---|---|
| Order | Get, Get Many, Update Status, Update Notes |
| Product | Create, Get, Get Many, Update, Delete |
| Customer | Get, Get Many |
| Category | Create, Get, Get Many, Update, Delete |
| Discount | Create, Get, Get Many, Update, Delete |
| Store | Get, Get Stats |

**Karrito Trigger** checks for new orders on the schedule you choose. Test orders are skipped, and orders that existed before you activated the workflow are not replayed.

The Karrito node can be used as a tool by n8n AI agents.

## Example workflows

- **New order → Google Sheets**: Karrito Trigger → Google Sheets *Append Row* with order number, customer, total and date.
- **New order → Slack or Telegram**: Karrito Trigger → Slack *Send Message* with `Order #{{$json.orderNumber}} – {{$json.total}} {{$json.currency}}`.
- **Daily sales summary**: Schedule Trigger (every day) → Karrito *Store → Get Stats* → Email or Slack.

## Compatibility

Tested with n8n 1.x. Requires Node.js 20 or later.

## Resources

- [Karrito API reference (OpenAPI)](https://karrito.app/.well-known/openapi.json)
- [Karrito documentation](https://docs.karrito.app)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## License

[MIT](LICENSE)
