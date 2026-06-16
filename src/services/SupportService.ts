import { currentUserSignal } from "../signals/auth.signals";
import { ordersSignal } from "../signals/data.signals";

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

const SUPPORT_EMAIL = "soporte@electroprice.com";

/**
 * Rule-based customer support assistant. The storefront no longer uses an AI
 * model; replies are deterministic and point customers to their account or to
 * the support inbox.
 */
export class SupportService {
    async sendMessage(text: string): Promise<string> {
        const user = currentUserSignal.value;
        const recentOrders = ordersSignal.value.slice(-3);
        const lower = text.toLowerCase();

        if (/(pedido|orden|order|compra)/.test(lower)) {
            if (!user) {
                return `Inicia sesión para consultar el estado de tus pedidos, o escríbenos a ${SUPPORT_EMAIL}.`;
            }
            const last = recentOrders[recentOrders.length - 1];
            if (!last) {
                return "Aún no tienes pedidos en tu cuenta. Cuando hagas una compra podrás seguirla desde Mi cuenta > Pedidos.";
            }
            return `Tu pedido más reciente (#${last.id}) está en estado: ${last.status}. Puedes ver el detalle en Mi cuenta > Pedidos.`;
        }

        if (/(env[íi]o|shipping|entrega|tracking|rastreo)/.test(lower)) {
            return "Enviamos a todo el país con seguimiento. El tiempo estimado y el número de guía aparecen en cada pedido dentro de Mi cuenta > Pedidos.";
        }

        if (/(devol|return|reembol|refund|garant[íi]a|warranty)/.test(lower)) {
            return `Puedes solicitar una devolución desde el detalle de un pedido entregado en Mi cuenta > Pedidos. Para garantías escríbenos a ${SUPPORT_EMAIL}.`;
        }

        return `Gracias por tu mensaje. Para pedidos y envíos visita Mi cuenta > Pedidos, o escríbenos a ${SUPPORT_EMAIL} y con gusto te ayudamos.`;
    }

    clearHistory() {
        // No conversation state is retained in the rule-based assistant.
    }
}
