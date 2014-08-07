var bp = require('../');


payment = new bp.CardPayment({account_id: 'yourid', secret_key: 'yourkey', _debug: true});

//console.log('Payment type: ', payment.get('payment_type'));

payment.set('amount', 501.55);
payment.set('payment_account', '4111111111111111');
payment.set('card_cvv2', 123);
payment.set('card_expire', '1114');

payment.exec(function(err, res){

  //console.log('Exec cb', arguments);

});

payment.exec(function(err, res){

  //console.log('Exec cb', arguments);

});

