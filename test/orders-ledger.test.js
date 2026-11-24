'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const orders = require('../lib/orders');
const dates = require('../lib/dates');
const ledger = require('../lib/ledger');

function ordersDb() {
  return {
    orders: [
      { id: 1, date: '15/03/2022' },
      { id: 2, date: '30/01/2022' },
      { id: 3, date: '28/12/2021' }
    ]
  };
}

function ledgerDb() {
  return {
    customers: [{
      id: 7,
      name: 'Test Customer',
      openingBalance: 0,
      totalBilled: 2432.01,
      totalSettled: 1200,
      balance: 1232.01
    }],
    settlements: [],
    nextSettlementId: 501
  };
}

test('CORRECT BEHAVIOUR: dates are chronological and settlement payloads are numeric and validated', function () {
  const history = ordersDb();
  const validSettlementDb = ledgerDb();
  const stringSettlement = ledger.recordSettlement(validSettlementDb, 7, '500', 'cash');
  const invalidResults = [0, -500, 'not-a-number'].map(function (amount) {
    const db = ledgerDb();
    return ledger.recordSettlement(db, 7, amount).ok;
  });

  assert.deepEqual({
    allOrders: orders.list(history).map(function (order) { return order.id; }),
    fromOrders: orders.list(history, { from: '2022-01-01' }).map(function (order) { return order.id; }),
    toOrders: orders.list(history, { to: '2022-02-01' }).map(function (order) { return order.id; }),
    totalSettled: stringSettlement.customer.totalSettled,
    balance: stringSettlement.customer.balance,
    settlementAmount: stringSettlement.settlement.amount,
    invalidAccepted: invalidResults
  }, {
    allOrders: [1, 2, 3],
    fromOrders: [1, 2],
    toOrders: [2, 3],
    totalSettled: 1700,
    balance: 732.01,
    settlementAmount: 500,
    invalidAccepted: [false, false, false]
  });
});

test('orders.list sorts mixed DD/MM/YYYY dates newest first by calendar date', function () {
  assert.deepEqual(orders.list(ordersDb()).map(function (order) { return order.id; }), [1, 2, 3]);
});

test('orders.list applies the YYYY-MM-DD from filter by calendar date', function () {
  assert.deepEqual(
    orders.list(ordersDb(), { from: '2022-01-01' }).map(function (order) { return order.id; }),
    [1, 2]
  );
});

test('orders.list applies the YYYY-MM-DD to filter inclusively by calendar date', function () {
  assert.deepEqual(
    orders.list(ordersDb(), { to: '2022-02-01' }).map(function (order) { return order.id; }),
    [2, 3]
  );
});

test('CURRENT BEHAVIOUR: dates.normalizeDateKey rearranges ISO dates and trims DD/MM/YYYY', function () {
  assert.equal(dates.normalizeDateKey('2022-03-15'), '15/03/2022');
  assert.equal(dates.normalizeDateKey(' 15/03/2022 '), '15/03/2022');
});

test('CURRENT BEHAVIOUR: recordSettlement adds a numeric amount and recalculates balance', function () {
  const db = ledgerDb();
  const result = ledger.recordSettlement(db, 7, 500, 'cash', 'counter payment');

  assert.equal(result.ok, true);
  assert.equal(result.customer.totalSettled, 1700);
  assert.equal(result.customer.balance, 732.01);
  assert.equal(result.settlement.amount, 500);
});

test('recordSettlement treats a JSON string amount as a number', function () {
  const db = ledgerDb();
  const result = ledger.recordSettlement(db, 7, '500', 'cash', 'counter payment');

  assert.equal(result.ok, true);
  assert.equal(result.customer.totalSettled, 1700);
  assert.equal(result.customer.balance, 732.01);
  assert.equal(result.settlement.amount, 500);
});

test('CURRENT BEHAVIOUR: recordSettlement rejects zero without changing the customer', function () {
  const db = ledgerDb();
  const result = ledger.recordSettlement(db, 7, 0);

  assert.equal(result.ok, false);
  assert.equal(result.error, 'Settlement amount must be greater than zero');
  assert.equal(db.customers[0].totalSettled, 1200);
  assert.equal(db.customers[0].balance, 1232.01);
  assert.equal(db.settlements.length, 0);
});

test('CURRENT BEHAVIOUR: recordSettlement rejects a negative amount without changing the customer', function () {
  const db = ledgerDb();
  const result = ledger.recordSettlement(db, 7, -500);

  assert.equal(result.ok, false);
  assert.equal(result.error, 'Settlement amount must be greater than zero');
  assert.equal(db.customers[0].totalSettled, 1200);
  assert.equal(db.customers[0].balance, 1232.01);
  assert.equal(db.settlements.length, 0);
});

test('recordSettlement rejects a non-numeric string without changing the customer', function () {
  const db = ledgerDb();
  const result = ledger.recordSettlement(db, 7, 'not-a-number');

  assert.equal(result.ok, false);
  assert.equal(result.error, 'Settlement amount must be greater than zero');
  assert.equal(db.customers[0].totalSettled, 1200);
  assert.equal(db.customers[0].balance, 1232.01);
  assert.equal(db.settlements.length, 0);
});
