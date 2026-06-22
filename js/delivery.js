(function () {
  function deliveryScreen(params) {
    if (!window.HopprUI.requireUser()) return '';
    const tab = params.tab || 'parcel';
    return window.HopprUI.shell('Delivery Services', 'Book parcel delivery or food delivery with location details and payment method selected before request.',
      '<div class="segmented"><button type="button" id="parcelTab" class="' + (tab === 'parcel' ? 'active' : '') + '">Parcel</button><button type="button" id="foodTab" class="' + (tab === 'food' ? 'active' : '') + '">Food</button></div>' +
      (tab === 'parcel' ? parcelForm() : foodForm()) + deliveryList()
    );
  }

  function parcelForm() {
    return '<form id="parcelForm" class="form-card">' +
      window.HopprUI.select('parcelPickup', 'Pickup Location', window.HopprData.locations, 'Kolej Tun Razak') +
      window.HopprUI.select('parcelDropoff', 'Drop-off Location', window.HopprData.locations, 'Faculty of Computing') +
      window.HopprUI.textArea('parcelDetails', 'Parcel Details', 'Small document envelope, receiver: Dr. Ahmad, receiver phone: +60 11 2345 6789', 'Parcel size, receiver and notes') +
      window.HopprUI.paymentSelector('cash') +
      '<div id="deliveryPreview" class="summary-card">' + deliveryPreview('Parcel', 'Kolej Tun Razak', 'Faculty of Computing', 3.80) + '</div>' +
      '<button class="primary-btn" type="submit">Book Parcel Delivery</button>' +
      '</form>';
  }

  function foodForm() {
    return '<form id="foodForm" class="form-card">' +
      window.HopprUI.select('foodVendor', 'Campus Vendor', window.HopprData.vendors, 'ArkED Meranti Food Court') +
      window.HopprUI.select('foodDropoff', 'Delivery Location', window.HopprData.locations, 'Kolej Rahman Putra') +
      window.HopprUI.textArea('foodOrder', 'Food Order Details', 'Nasi goreng ayam, less spicy, one iced tea. Please call when arrived.', 'Food name, quantity and notes') +
      window.HopprUI.paymentSelector('qr') +
      '<div id="deliveryPreview" class="summary-card">' + deliveryPreview('Food', 'ArkED Meranti Food Court', 'Kolej Rahman Putra', 4.60) + '</div>' +
      '<button class="primary-btn" type="submit">Order Food Delivery</button>' +
      '</form>';
  }

  function deliveryPreview(type, from, to, fee) {
    const method = window.HopprUI.el('paymentMethod') ? window.HopprUI.paymentMethodLabel(window.HopprUI.el('paymentMethod').value) : 'Cash after completion';
    return window.HopprUI.summaryLine('Service Type', type) +
      window.HopprUI.summaryLine('Route', from + ' → ' + to) +
      window.HopprUI.summaryLine('Payment Method', method) +
      window.HopprUI.summaryLine('Estimated Fee', window.HopprUI.money(fee), 'total');
  }

  function deliveryList() {
    const orders = window.HopprState.deliveryOrders;
    if (!orders.length) return '<div class="empty-card"><strong>No delivery records yet</strong>Use the parcel or food form to create a trackable delivery order.</div>';
    return '<h3 class="section-title">Recent Deliveries</h3><div class="list-card">' + orders.map(function (order) {
      return '<div class="list-row"><div class="row-icon">' + (order.type === 'Food' ? '🍱' : '📦') + '</div><div class="row-main"><strong>' + window.HopprUI.escape(order.id) + ' · ' + window.HopprUI.escape(order.type) + '</strong><span>' + window.HopprUI.escape(order.from) + ' → ' + window.HopprUI.escape(order.to) + '<br>Payment: ' + window.HopprUI.escape(order.paymentMethod || 'Not selected') + '</span></div><span class="badge warning">' + window.HopprUI.escape(order.status) + '</span></div>';
    }).join('') + '</div>';
  }

  function refreshDeliveryPreview() {
    const preview = window.HopprUI.el('deliveryPreview');
    if (!preview) return;
    const parcelPickup = window.HopprUI.el('parcelPickup');
    const parcelDropoff = window.HopprUI.el('parcelDropoff');
    const foodVendor = window.HopprUI.el('foodVendor');
    const foodDropoff = window.HopprUI.el('foodDropoff');
    window.HopprUI.toggleNewCardFields();
    if (parcelPickup && parcelDropoff) {
      preview.innerHTML = deliveryPreview('Parcel', parcelPickup.value, parcelDropoff.value, 3.80);
    }
    if (foodVendor && foodDropoff) {
      preview.innerHTML = deliveryPreview('Food', foodVendor.value, foodDropoff.value, 4.60);
    }
  }

  function bindDelivery() {
    ['parcelPickup', 'parcelDropoff', 'foodVendor', 'foodDropoff', 'paymentMethod'].forEach(function (id) {
      const field = window.HopprUI.el(id);
      if (field) field.addEventListener('change', refreshDeliveryPreview);
    });
    window.HopprUI.toggleNewCardFields();
    const parcelTab = window.HopprUI.el('parcelTab');
    const foodTab = window.HopprUI.el('foodTab');
    if (parcelTab) parcelTab.addEventListener('click', function () { window.HopprRouter.go('delivery', { tab: 'parcel' }); });
    if (foodTab) foodTab.addEventListener('click', function () { window.HopprRouter.go('delivery', { tab: 'food' }); });

    const parcelFormElement = window.HopprUI.el('parcelForm');
    if (parcelFormElement) parcelFormElement.addEventListener('submit', function (event) {
      event.preventDefault();
      const from = window.HopprUI.el('parcelPickup').value;
      const to = window.HopprUI.el('parcelDropoff').value;
      const details = window.HopprUI.el('parcelDetails').value.trim();
      if (from === to) {
        window.HopprUI.toast('Pickup and drop-off cannot be the same.', 'danger');
        return;
      }
      if (!details) {
        window.HopprUI.toast('Please describe the parcel.', 'danger');
        return;
      }
      const payment = window.HopprUI.collectPaymentDetails();
      if (!payment) return;
      const order = { id: window.HopprUI.createId('P'), type: 'Parcel', from: from, to: to, details: details, status: 'Driver Assigned', fee: 3.8, code: Math.floor(100000 + Math.random() * 899999), date: 'Today, just now', paid: false, paymentMethodId: payment.id, paymentMethod: payment.label, paymentType: payment.type };
      window.HopprState.activeDelivery = order;
      window.HopprState.deliveryOrders.unshift(order);
      window.HopprState.notifications.unshift('Parcel tracking code ' + order.code + ' generated. Payment selected: ' + order.paymentMethod + '.');
      window.HopprUI.toast('Parcel delivery created. Payment method saved before request.', 'success');
      window.HopprRouter.go('deliveryTracking');
    });

    const foodFormElement = window.HopprUI.el('foodForm');
    if (foodFormElement) foodFormElement.addEventListener('submit', function (event) {
      event.preventDefault();
      const vendor = window.HopprUI.el('foodVendor').value;
      const to = window.HopprUI.el('foodDropoff').value;
      const orderText = window.HopprUI.el('foodOrder').value.trim();
      if (!orderText) {
        window.HopprUI.toast('Please enter your food order details.', 'danger');
        return;
      }
      const payment = window.HopprUI.collectPaymentDetails();
      if (!payment) return;
      const order = { id: window.HopprUI.createId('F'), type: 'Food', from: vendor, to: to, details: orderText, status: 'Preparing Food', fee: 4.6, code: Math.floor(100000 + Math.random() * 899999), date: 'Today, just now', paid: false, paymentMethodId: payment.id, paymentMethod: payment.label, paymentType: payment.type };
      window.HopprState.activeDelivery = order;
      window.HopprState.deliveryOrders.unshift(order);
      window.HopprState.notifications.unshift('Food delivery order ' + order.id + ' has been sent to ' + vendor + '. Payment selected: ' + order.paymentMethod + '.');
      window.HopprUI.toast('Food order created. Payment method saved before request.', 'success');
      window.HopprRouter.go('deliveryTracking');
    });
  }

  function deliveryTrackingScreen() {
    if (!window.HopprUI.requireUser()) return '';
    const order = window.HopprState.activeDelivery;
    if (!order) return window.HopprUI.shell('Delivery Tracking', 'No active delivery order.', '<div class="empty-card"><strong>No active delivery</strong>Create a parcel or food order first.</div>');
    const steps = order.type === 'Food' ? ['Preparing Food', 'Driver Assigned', 'Picked Up', 'On the way', 'Delivered'] : ['Driver Assigned', 'Picked Up', 'On the way', 'Delivered'];
    const current = Math.max(0, steps.indexOf(order.status));
    const paymentHint = order.status === 'Delivered' ? 'Payment can now be confirmed.' : 'Cash and QR payment are confirmed after delivery is completed.';
    return window.HopprUI.shell(order.type + ' Tracking', 'Track live delivery updates and confirm payment after delivery completion.',
      '<div class="summary-card">' +
        window.HopprUI.summaryLine('Order ID', order.id) +
        window.HopprUI.summaryLine('Tracking Code', String(order.code)) +
        window.HopprUI.summaryLine('Route', order.from + ' → ' + order.to) +
        window.HopprUI.summaryLine('Payment Method', order.paymentMethod || 'Not selected') +
        window.HopprUI.summaryLine('Delivery Fee', window.HopprUI.money(order.fee), 'total') +
      '</div>' +
      window.HopprUI.timeline(steps, current) +
      '<div class="auth-prompt"><strong>Payment rule</strong><p class="help-text">' + paymentHint + '</p></div>' +
      '<div class="button-row"><button id="nextDeliveryStatus" class="primary-btn" type="button">Next Status</button><button id="deliveryPayment" class="secondary-btn" type="button">Payment</button></div>'
    );
  }

  function bindDeliveryTracking() {
    const next = window.HopprUI.el('nextDeliveryStatus');
    if (next) next.addEventListener('click', function () {
      const order = window.HopprState.activeDelivery;
      const flow = order.type === 'Food' ? ['Preparing Food', 'Driver Assigned', 'Picked Up', 'On the way', 'Delivered'] : ['Driver Assigned', 'Picked Up', 'On the way', 'Delivered'];
      const index = Math.max(0, flow.indexOf(order.status));
      const nextIndex = Math.min(index + 1, flow.length - 1);
      order.status = flow[nextIndex];
      if (order.status === 'Delivered') {
        window.HopprState.rideHistory.unshift({ id: order.id, type: order.type, route: order.from + ' → ' + order.to, date: 'Today, just now', fare: order.fee, status: 'Delivered' });
        window.HopprUI.toast(order.type + ' order delivered. You can now confirm payment.', 'success');
      } else {
        window.HopprUI.toast('Delivery status updated: ' + order.status, 'success');
      }
      window.HopprRouter.go('deliveryTracking');
    });

    const payment = window.HopprUI.el('deliveryPayment');
    if (payment) payment.addEventListener('click', function () {
      if (!orderIsDelivered()) {
        window.HopprUI.toast('Payment is confirmed after the delivery is completed.', 'warning');
        return;
      }
      window.HopprState.pendingPayment = { serviceType: window.HopprState.activeDelivery.type + ' Delivery', record: window.HopprState.activeDelivery };
      window.HopprRouter.go('payment');
    });
  }

  function orderIsDelivered() {
    return window.HopprState.activeDelivery && window.HopprState.activeDelivery.status === 'Delivered';
  }

  window.HopprRouter.register('delivery', deliveryScreen);
  window.HopprRouter.register('deliveryTracking', deliveryTrackingScreen);
  window.HopprBinders.delivery = bindDelivery;
  window.HopprBinders.deliveryTracking = bindDeliveryTracking;
})();
