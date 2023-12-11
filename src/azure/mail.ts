import { EmailClient, KnownEmailSendStatus, EmailContent } from '@azure/communication-email'
import { db } from '../db'

export async function sendNotificationEmail(
	client: EmailClient,
	senderAddress: string,
	recipient: string,
	content: EmailContent
) {
	const message = {
		senderAddress,
		recipients: {
			to: [{ address: recipient }]
		},
		content
	}
	const poller = await client.beginSend(message)
	if (!poller.getOperationState().isStarted) {
		throw new Error('Poller was not started.')
	}

	const POLLER_WAIT_TIME = 10

	let timeElapsed = 0
	while (!poller.isDone()) {
		poller.poll()

		await new Promise(resolve => setTimeout(resolve, POLLER_WAIT_TIME * 1000))
		timeElapsed += 10

		if (timeElapsed > 18 * POLLER_WAIT_TIME) {
			throw new Error('Polling timed out.')
		}
	}
	const result = poller.getResult()!
	if (result.status === KnownEmailSendStatus.Succeeded) {
		return result
	} else {
		throw new Error(result.error?.message)
	}
}

let client: EmailClient
export async function sendOrderNotification(order_id: number) {
	if (!process.env.AZURE_COMMUNICATION_SERVICE_CONNECTION_STRING || !process.env.NOTIFICATION_EMAIL_SENDER) {
		if (!(sendOrderNotification as any).warned) {
			console.warn('No email notification will be sent because environment variables are not set.')
			;(sendOrderNotification as any).warned = true
		}
		return
	}
	const { name, email } = await db
		.selectFrom('orders')
		.where('id', '=', order_id)
		.innerJoin('stores', 'store_id', 'stores.id')
		.select(['stores.email', 'stores.name'])
		.executeTakeFirstOrThrow()
	if (!client) {
		client = new EmailClient(process.env.AZURE_COMMUNICATION_SERVICE_CONNECTION_STRING)
	}
	const res = await sendNotificationEmail(client, process.env.NOTIFICATION_EMAIL_SENDER, email, {
		subject: `New order for ${name}!`,
		plainText: `New order #${order_id} has been created, please check your dashboard.`,
		html: `<html><h1>New order #${order_id} has been created, please check your dashboard.</h1></html>`
	})
	return {
		status: res.status,
		email
	}
}

/* istanbul ignore next */
if (require.main === module) {
	;(async () => {
		const recipient = process.argv[2]
		const { AZURE_COMMUNICATION_SERVICE_CONNECTION_STRING, NOTIFICATION_EMAIL_SENDER } = process.env
		const client = new EmailClient(AZURE_COMMUNICATION_SERVICE_CONNECTION_STRING!)
		const result = await sendNotificationEmail(client, NOTIFICATION_EMAIL_SENDER!, recipient, {
			subject: 'Test email from JS Sample',
			plainText: 'This is plaintext body of test email.',
			html: '<html><h1>This is the html body of test email.</h1></html>'
		})
		console.log(result)
	})()
}
