var bp = require('../');


/*payment = new bp.CardPayment({account_id: '100191228197', secret_key: 'FDDES3TGZ.4EFHOQESWXZLHOQOWOF70M', _debug: true});

//console.log('Payment type: ', payment.get('payment_type'));

payment.set('amount', 1);
payment.set('payment_account', '4111111111111111');
payment.set('card_cvv2', 123);
payment.set('card_expire', '1114');

payment.exec(function(err, res){

  console.log(err);
  console.log(res);

});*/

payment = new bp.CardRefund({account_id: '100191228197', secret_key: 'FDDES3TGZ.4EFHOQESWXZLHOQOWOF70M', _debug: true});

payment.set('amount', 1);
payment.set('payment_account', '');
payment.set('master_id', '100198235872');

payment.exec(function(err, res) {
  console.log(err);
  console.log(res);
});