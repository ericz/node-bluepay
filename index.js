var request = require('request');
var qs = require('qs');
var extend = require('extend');
var crypto = require('crypto');

var BLUEPAY_URL = 'https://secure.bluepay.com/interfaces/bp20post';

var REQUIRED = 1;
var OPTIONAL = 2;

function BluepayClient(options) {
  this.options = {
    _debug: false,
    _url: BLUEPAY_URL,
    _fields: {
      amount: REQUIRED,
      account_id: REQUIRED,
      trans_type: REQUIRED,
      payment_type: REQUIRED,
      secret_key: REQUIRED,
      payment_account: REQUIRED,

      f_rebilling: OPTIONAL,
      version: OPTIONAL,
      customer_ip: OPTIONAL,
      master_id: OPTIONAL,
      mode: OPTIONAL,
      order_id: OPTIONAL,
      custom_id: OPTIONAL,
      custom_id2: OPTIONAL,
      duplicate_override: OPTIONAL,

      // AVS
      name1: OPTIONAL,
      name2: OPTIONAL,
      addr1: OPTIONAL,
      addr2: OPTIONAL,
      city: OPTIONAL,
      state: OPTIONAL,
      zip: OPTIONAL,
      country: OPTIONAL, // ISO 3166
      email: OPTIONAL,
      phone: OPTIONAL

    },
    mode: 'TEST',
    trans_type: 'SALE',
    version: 1

  };

  // Extend default options with user options
  extend(true, this.options, options);
}

BluepayClient.prototype.get = function(key) {
  return this.options[key];
}

BluepayClient.prototype.set = function(key, value) {
  this.options[key] = value;
  return this;
}

BluepayClient.prototype.exec = function(cb) {
  var self = this;
  var form = util.pick(this.options, this.options._fields);
  if (form.constructor === Error) {
    return cb(form);
  }
  form.TAMPER_PROOF_SEAL = this._seal(form);
  if (this.options._debug) {console.log('Sending request:', form);}
  request.post(this.options._url, {form: form}, function(err, res, body) {
    if (err) {
      return cb(err);
    }
    var response = qs.parse(body);
    if (self.options._debug) {console.log('Bluepay response:', response);}
    cb(null, response);
  });
}

BluepayClient.prototype._seal = function(form) {
  var md5 = crypto.createHash('md5');
  md5.update(form.SECRET_KEY);
  md5.update(form.ACCOUNT_ID);
  md5.update(form.TRANS_TYPE);
  md5.update(form.AMOUNT);
  md5.update(form.MASTER_ID || '');
  md5.update(form.NAME1 || '');
  md5.update(form.PAYMENT_ACCOUNT);
  return md5.digest('hex');
}


function CardPayment(options) {
  return new BluepayClient(extend({
    payment_type: 'CREDIT',
    _fields: {
      card_cvv2: REQUIRED,
      card_expire: REQUIRED
    }
  }, options));
}

function CardRefund(options) {
  return new BluepayClient(extend({
    payment_type: 'CREDIT',
    trans_type: 'REFUND',
    payment_account: '',
    _fields: {
      master_id: REQUIRED
    }
  }, options));
}


function ACHPayment(options) {
  return new BluepayClient(extend({
    payment_type: 'ACH',
    _fields: {
      doc_type: OPTIONAL
    }
  }, options));
}

exports.ACHPayment = ACHPayment;
exports.CardPayment = CardPayment;
exports.CardRefund = CardRefund;



var BLUEPAY_MESSAGES = {
  'inv tran type': 'Credit card type not currently supported',
  'amount may not be zero.': 'Payment amount must be greater than $0',
  'missing payment account': 'Invalid credit card number',
  'card expired': 'Credit card expiration date is not valid',
  'expiration date required for credit': 'Credit card expiration date is not valid',
  'duplicate': 'The transaction has been rejected for being a duplicate attempt',
  'invalid cvv2': 'Card verfication number (CVV2) or expiration date incorrect',
  'card account not valid': 'Invalid credit card number',
  'approved sale': 'Payment successfully processed',
  'cvv2 decline': 'Card verfication number (CVV2) or expiration date incorrect',
  'avs decline': 'Billing address verfication failed',
  'error selecting processor': 'Payment could not be processed (double check the amount?)',
  'auth/tkt': 'Payment successfully processed',
  'sec violation': 'Card verfication number (CVV2) or expiration date incorrect',
  'no such issuer': 'Invalid credit card number'
}

var util = {
  // Translate BluePay messages into something sensible
  message: function(message) {
    if (!message) {
      return message;
    }
    return BLUEPAY_MESSAGES[message.trim().toLowerCase()] || message;
  },



  // Returns object of properties selected from data based on rules in fields
  // fields = {
  //   a: REQUIRED,
  //   b: OPTIONAL
  // }
  pick: function pick(data, fields) {
    var out = {};
    var keys = Object.keys(fields);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var required = (fields[key] === REQUIRED);
      var value = data[key];
      if (required && value === undefined) {
        return new Error("Missing required field '" + key + "'");
      } else if (value !== undefined) {
        out[key.toUpperCase()] = value.toString();
      }
    }
    return out;
  }
}
// External util functions
exports.util = util;
