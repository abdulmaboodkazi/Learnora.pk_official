import { PaymentMethod, PaymentStatus, PaymentTransaction } from '../../src/types/index.ts';

export interface PaymentIntentOptions {
  orderId: string;
  orderNumber: string;
  userId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  providerTransactionId: string;
  status: PaymentStatus;
  redirectUrl?: string;
  requiresAction?: boolean;
  message: string;
  metadata?: Record<string, any>;
}

export interface RefundOptions {
  transactionId: string;
  orderId: string;
  amount: number;
  reason: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  status: 'Refunded' | 'Partially Refunded';
  amount: number;
  message: string;
}

export interface PaymentProvider {
  name: string;
  createPayment(options: PaymentIntentOptions): Promise<PaymentResult>;
  verifyPayment(payload: { transactionId?: string; providerTransactionId?: string; [key: string]: any }): Promise<PaymentResult>;
  refundPayment(options: RefundOptions): Promise<RefundResult>;
  verifyWebhookSignature(payload: any, signature: string): boolean;
}

/**
 * Modern Tokenized / Hosted Online Gateway Provider (e.g. Stripe / Checkout / PayFast)
 * Validates server-side, simulates tokenization/hosted flow, supports webhook callbacks and refunds.
 */
export class OnlineGatewayProvider implements PaymentProvider {
  name = 'Online Payment Gateway (Tokenized)';

  async createPayment(options: PaymentIntentOptions): Promise<PaymentResult> {
    const providerTransactionId = `pg_live_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // In a real integration, this calls the gateway's /v1/checkout/sessions or /v1/payment_intents
    return {
      success: true,
      transactionId,
      providerTransactionId,
      status: 'Processing',
      redirectUrl: `/checkout/payment-gateway?session_id=${providerTransactionId}&order_id=${options.orderId}`,
      requiresAction: true,
      message: 'Payment intent initialized securely server-side. Awaiting customer authorization.',
      metadata: {
        gateway: 'Stripe/Hosted Gateway Standard',
        clientSecret: `cs_${Math.random().toString(36).substring(2, 18)}`,
        idempotencyKey: `idemp_${options.orderId}_${Date.now()}`,
      },
    };
  }

  async verifyPayment(payload: { transactionId?: string; providerTransactionId?: string; simulateFailure?: boolean }): Promise<PaymentResult> {
    if (payload.simulateFailure) {
      return {
        success: false,
        transactionId: payload.transactionId || 'unknown',
        providerTransactionId: payload.providerTransactionId || 'unknown',
        status: 'Failed',
        message: 'The card was declined or authorization was aborted by customer.',
      };
    }

    return {
      success: true,
      transactionId: payload.transactionId || `txn_${Date.now()}`,
      providerTransactionId: payload.providerTransactionId || `pg_live_${Date.now()}`,
      status: 'Paid',
      message: 'Payment verified successfully server-side via payment provider API.',
      metadata: {
        verifiedAt: new Date().toISOString(),
        paymentMethodDetails: 'Card (Visa / Mastercard Tokenized)',
      },
    };
  }

  async refundPayment(options: RefundOptions): Promise<RefundResult> {
    const refundId = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      refundId,
      status: 'Refunded',
      amount: options.amount,
      message: `Refund of Rs. ${options.amount.toLocaleString()} successfully processed via payment gateway.`,
    };
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    // In production, HMAC-SHA256 signature verification with PAYMENT_WEBHOOK_SECRET
    return Boolean(signature && signature.length > 5);
  }
}

/**
 * Direct Bank Transfer Provider
 * Displays store's bank details; customer submits transfer reference or payment slip;
 * Status starts as 'Pending Verification' and is approved/rejected by Admin.
 */
export class BankTransferProvider implements PaymentProvider {
  name = 'Direct Bank Transfer';

  async createPayment(options: PaymentIntentOptions): Promise<PaymentResult> {
    const transactionId = `bt_txn_${Date.now()}`;
    return {
      success: true,
      transactionId,
      providerTransactionId: `BT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'Pending Verification',
      message: 'Bank transfer initiated. Please submit your deposit reference/receipt.',
      metadata: {
        bankName: 'Standard Chartered / Meezan Bank',
        accountTitle: 'LEARNORA RETAIL PVT LTD',
        accountNumber: '01029384819201',
        iban: 'PK36SCBL0000001029384819',
      },
    };
  }

  async verifyPayment(payload: { transactionId?: string; referenceNumber?: string; approvedByAdmin?: boolean }): Promise<PaymentResult> {
    if (payload.approvedByAdmin) {
      return {
        success: true,
        transactionId: payload.transactionId || `bt_txn_${Date.now()}`,
        providerTransactionId: payload.referenceNumber || 'BT-REF',
        status: 'Paid',
        message: 'Bank transfer receipt confirmed and funds verified by finance administrator.',
      };
    }
    return {
      success: false,
      transactionId: payload.transactionId || 'unknown',
      providerTransactionId: payload.referenceNumber || 'BT-REF',
      status: 'Pending Verification',
      message: 'Awaiting administrative verification of bank slip.',
    };
  }

  async refundPayment(options: RefundOptions): Promise<RefundResult> {
    return {
      success: true,
      refundId: `ref_bt_${Date.now()}`,
      status: 'Refunded',
      amount: options.amount,
      message: 'Bank transfer refund registered for manual reversal.',
    };
  }

  verifyWebhookSignature(): boolean {
    return true;
  }
}

/**
 * Cash on Delivery Provider
 * Payment is collected in cash at the customer doorstep upon delivery.
 */
export class CashOnDeliveryProvider implements PaymentProvider {
  name = 'Cash on Delivery (COD)';

  async createPayment(options: PaymentIntentOptions): Promise<PaymentResult> {
    const transactionId = `cod_txn_${Date.now()}`;
    return {
      success: true,
      transactionId,
      providerTransactionId: `COD-${options.orderNumber}`,
      status: 'Pending',
      message: 'Cash on Delivery selected. Full payment of order total to be handed to delivery agent.',
      metadata: {
        collectionTerms: 'Pay in cash upon physical receipt of package',
      },
    };
  }

  async verifyPayment(payload: { transactionId?: string; collectedOnDelivery?: boolean }): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: payload.transactionId || `cod_txn_${Date.now()}`,
      providerTransactionId: 'COD-CONFIRMED',
      status: payload.collectedOnDelivery ? 'Paid' : 'Pending',
      message: payload.collectedOnDelivery ? 'Cash collected upon delivery by courier.' : 'Awaiting courier delivery collection.',
    };
  }

  async refundPayment(options: RefundOptions): Promise<RefundResult> {
    return {
      success: true,
      refundId: `ref_cod_${Date.now()}`,
      status: 'Refunded',
      amount: options.amount,
      message: 'Cash refund / store credit issued for COD order.',
    };
  }

  verifyWebhookSignature(): boolean {
    return true;
  }
}

/**
 * Unified Payment Service
 * Dispatches to pluggable providers and acts as single source of truth for payment lifecycle.
 */
export class PaymentService {
  private providers: Record<PaymentMethod, PaymentProvider>;

  constructor() {
    this.providers = {
      card: new OnlineGatewayProvider(),
      bank_transfer: new BankTransferProvider(),
      cod: new CashOnDeliveryProvider(),
    };
  }

  getProvider(method: PaymentMethod): PaymentProvider {
    const provider = this.providers[method];
    if (!provider) {
      throw new Error(`Unsupported payment method: ${method}`);
    }
    return provider;
  }

  async initializePayment(options: PaymentIntentOptions): Promise<PaymentResult> {
    const provider = this.getProvider(options.paymentMethod);
    return provider.createPayment(options);
  }

  async verifyPayment(method: PaymentMethod, payload: any): Promise<PaymentResult> {
    const provider = this.getProvider(method);
    return provider.verifyPayment(payload);
  }

  async processRefund(method: PaymentMethod, options: RefundOptions): Promise<RefundResult> {
    const provider = this.getProvider(method);
    return provider.refundPayment(options);
  }
}

export const paymentService = new PaymentService();
