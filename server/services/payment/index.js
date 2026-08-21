/**
 * Payment Gateway Service Factory & Router
 */

'use strict';

const MockPaymentGateway = require('./mockGateway');
const ZiraatPaymentGateway = require('./ziraatGateway');

const mockGatewayInstance = new MockPaymentGateway();
const ziraatGatewayInstance = new ZiraatPaymentGateway();

/**
 * Returns active gateway instance depending on environment configuration.
 *
 * @param {string} [providerOverride]
 * @returns {import('./gateway')}
 */
function getPaymentGateway(providerOverride) {
  const provider = (providerOverride || process.env.PAYMENT_PROVIDER || 'mock').toLowerCase();

  if (provider === 'ziraat') {
    return ziraatGatewayInstance;
  }

  return mockGatewayInstance;
}

module.exports = {
  getPaymentGateway,
  MockPaymentGateway,
  ZiraatPaymentGateway,
};
