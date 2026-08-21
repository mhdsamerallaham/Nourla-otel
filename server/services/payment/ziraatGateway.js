/**
 * ZiraatPaymentGateway - Ziraat Bank Sanal POS (EST / NestPay 3D Secure v2 Integration)
 *
 * Prepared for live credentials.
 * Reads environment variables:
 * - ZIRAAT_MERCHANT_ID
 * - ZIRAAT_TERMINAL_ID
 * - ZIRAAT_CLIENT_ID
 * - ZIRAAT_USERNAME
 * - ZIRAAT_PASSWORD
 * - ZIRAAT_STORE_KEY
 * - ZIRAAT_ENVIRONMENT (test / production)
 * - ZIRAAT_API_URL
 */

'use strict';

const crypto = require('crypto');
const axios = require('axios');
const PaymentGateway = require('./gateway');

class ZiraatPaymentGateway extends PaymentGateway {
  constructor() {
    super('ZiraatPaymentGateway');

    this.merchantId = process.env.ZIRAAT_MERCHANT_ID;
    this.terminalId = process.env.ZIRAAT_TERMINAL_ID;
    this.clientId = process.env.ZIRAAT_CLIENT_ID;
    this.username = process.env.ZIRAAT_USERNAME;
    this.password = process.env.ZIRAAT_PASSWORD;
    this.storeKey = process.env.ZIRAAT_STORE_KEY;
    this.environment = process.env.ZIRAAT_ENVIRONMENT || 'test';
    this.apiUrl = process.env.ZIRAAT_API_URL || 
      (this.environment === 'production' 
        ? 'https://sanalpos2.ziraatbank.com.tr/fim/api' 
        : 'https://entegrasyon.ziraatbank.com.tr/fim/api');
    this.gatewayUrl = process.env.ZIRAAT_GATEWAY_URL || 
      (this.environment === 'production' 
        ? 'https://sanalpos2.ziraatbank.com.tr/fim/est3Dgate' 
        : 'https://entegrasyon.ziraatbank.com.tr/fim/est3Dgate');
  }

  _ensureCredentials() {
    const merchantId = this.merchantId || process.env.ZIRAAT_MERCHANT_ID;
    const clientId = this.clientId || process.env.ZIRAAT_CLIENT_ID;
    const storeKey = this.storeKey || process.env.ZIRAAT_STORE_KEY;

    if (!merchantId || !clientId || !storeKey) {
      throw new Error(
        '[ZIRAAT PAYMENT ERROR] Ziraat Bankası Sanal POS bilgileri eksiktir. ' +
        'Lütfen ZIRAAT_MERCHANT_ID, ZIRAAT_CLIENT_ID ve ZIRAAT_STORE_KEY environment variable değerlerini tanımlayın.'
      );
    }
  }

  /**
   * Builds Nestpay / EST Hash signature
   */
  generateHash(clientId, oid, amount, okUrl, failUrl, isttype, rnd, storeKey) {
    const hashStr = `${clientId}${oid}${amount}${okUrl}${failUrl}${isttype}${rnd}${storeKey}`;
    return crypto.createHash('sha512').update(hashStr, 'utf8').digest('base64');
  }

  /**
   * Initializes 3D Secure payment for Ziraat POS
   */
  async initializePayment({ reservation, card, callbackUrl }) {
    this._ensureCredentials();

    const oid = `ZIR-${reservation.reservation_code}-${Date.now()}`;
    const amount = parseFloat(reservation.total_price).toFixed(2);
    const currency = reservation.currency === 'TRY' ? '949' : (reservation.currency === 'EUR' ? '978' : '840');
    const rnd = Date.now().toString();
    const storeType = '3d_pay'; // 3D Pay Model
    const isttype = 'Auth';

    const hash = this.generateHash(this.clientId, oid, amount, callbackUrl, callbackUrl, isttype, rnd, this.storeKey);

    const postParams = {
      clientid: this.clientId,
      storetype: storeType,
      hash,
      trantype: isttype,
      amount,
      currency,
      oid,
      okUrl: callbackUrl,
      failUrl: callbackUrl,
      rnd,
      pan: (card?.cardNumber || '').replace(/\s+/g, ''),
      cv2: card?.cvv || '',
      Esecure_expiry: `${card?.expMonth}/${card?.expYear}`,
      cardHolderName: card?.cardHolderName || '',
      lang: 'tr',
    };

    const formInputs = Object.keys(postParams)
      .map((key) => `<input type="hidden" name="${key}" value="${postParams[key]}" />`)
      .join('\n');

    const htmlForm = `
      <form id="ziraat3dform" action="${this.gatewayUrl}" method="POST">
        ${formInputs}
      </form>
      <script>document.getElementById('ziraat3dform').submit();</script>
    `;

    return {
      success: true,
      status: 'REQUIRES_ACTION',
      transactionId: oid,
      requires3D: true,
      redirectUrl: this.gatewayUrl,
      htmlForm,
    };
  }

  /**
   * Processes callback verification coming from Ziraat 3D Secure
   */
  async processCallback(payload) {
    this._ensureCredentials();

    const {
      clientid,
      oid,
      AuthCode,
      Response,
      ProcReturnCode,
      HASH,
      rnd,
      HASHPARAMS,
      HASHPARAMSVAL,
      errMsg,
    } = payload;

    if (Response === 'Approved' && ProcReturnCode === '00') {
      // Validate signature
      if (HASHPARAMS && HASHPARAMSVAL && HASH) {
        const expectedHash = crypto.createHash('sha512').update(HASHPARAMSVAL + this.storeKey, 'utf8').digest('base64');
        if (expectedHash !== HASH) {
          console.warn('[ZIRAAT CALLBACK WARNING] Hash mismatch detected!');
        }
      }

      return {
        success: true,
        status: 'SUCCESS',
        transactionId: oid,
        authCode: AuthCode,
        gatewayCode: ProcReturnCode,
        message: 'Ziraat Sanal POS 3D Ödeme Başarılı.',
        rawResponse: payload,
      };
    }

    return {
      success: false,
      status: 'FAILED',
      transactionId: oid,
      gatewayCode: ProcReturnCode || '99',
      errorMessage: errMsg || 'Ziraat Sanal POS ödeme işlemi onaylanmadı.',
      rawResponse: payload,
    };
  }

  /**
   * Verifies status directly via API query
   */
  async verifyPayment(transactionId) {
    this._ensureCredentials();

    const xmlPayload = `
      <CC5Request>
        <Name>${this.username}</Name>
        <Password>${this.password}</Password>
        <ClientId>${this.clientId}</ClientId>
        <OrderId>${transactionId}</OrderId>
        <Extra>
          <ORDERHISTORY>QUERY</ORDERHISTORY>
        </Extra>
      </CC5Request>
    `;

    try {
      const response = await axios.post(this.apiUrl, xmlPayload, {
        headers: { 'Content-Type': 'text/xml' },
        timeout: 15000,
      });

      const isApproved = response.data && response.data.includes('<Response>Approved</Response>');
      return {
        success: isApproved,
        status: isApproved ? 'SUCCESS' : 'FAILED',
        transactionId,
        rawResponse: response.data,
      };
    } catch (err) {
      console.error('[ZIRAAT VERIFY ERROR]', err.message);
      return {
        success: false,
        status: 'FAILED',
        transactionId,
        errorMessage: err.message,
      };
    }
  }

  async refund({ transactionId, amount }) {
    this._ensureCredentials();
    const xmlPayload = `
      <CC5Request>
        <Name>${this.username}</Name>
        <Password>${this.password}</Password>
        <ClientId>${this.clientId}</ClientId>
        <OrderId>${transactionId}</OrderId>
        <Type>Credit</Type>
        <Total>${amount}</Total>
      </CC5Request>
    `;

    const response = await axios.post(this.apiUrl, xmlPayload, {
      headers: { 'Content-Type': 'text/xml' },
      timeout: 15000,
    });

    const isApproved = response.data && response.data.includes('<Response>Approved</Response>');
    return {
      success: isApproved,
      status: isApproved ? 'REFUNDED' : 'FAILED',
      refundId: `REF-${Date.now()}`,
      transactionId,
      amount,
      rawResponse: response.data,
    };
  }

  async cancel({ transactionId }) {
    this._ensureCredentials();
    const xmlPayload = `
      <CC5Request>
        <Name>${this.username}</Name>
        <Password>${this.password}</Password>
        <ClientId>${this.clientId}</ClientId>
        <OrderId>${transactionId}</OrderId>
        <Type>Void</Type>
      </CC5Request>
    `;

    const response = await axios.post(this.apiUrl, xmlPayload, {
      headers: { 'Content-Type': 'text/xml' },
      timeout: 15000,
    });

    const isApproved = response.data && response.data.includes('<Response>Approved</Response>');
    return {
      success: isApproved,
      status: isApproved ? 'CANCELLED' : 'FAILED',
      transactionId,
      rawResponse: response.data,
    };
  }
}

module.exports = ZiraatPaymentGateway;
