(function () {
  function rideScreen() {
    const from = 'Kolej Tun Razak';
    const to = 'Faculty of Computing';
    const active = window.HopprState.activeRide;
    const activeBox = active ? activeRideCard(active) : '<div class="empty-card"><strong>No active ride</strong>Book a ride to generate a fare estimate, driver assignment and tracking timeline.</div>';
    return window.HopprUI.shell('Ride Booking', 'Choose pickup, destination, vehicle type and payment method before sending the ride request.',
      '<form id="rideForm" class="form-card">' +
        window.HopprUI.select('pickupLocation', 'Pickup Location', window.HopprData.locations, from) +
        window.HopprUI.select('dropoffLocation', 'Destination', window.HopprData.locations, to) +
        '<div class="grid-2">' + window.HopprUI.select('vehicleType', 'Vehicle Type', window.HopprData.vehicleTypes, 'car') + window.HopprUI.select('rideTier', 'Service Tier', window.HopprData.tiers, 'standard') + '</div>' +
        window.HopprUI.paymentSelector('cash') +
        '<div id="farePreview" class="summary-card">' + fareSummary(calculateFare(from, to)) + '</div>' +
        '<button class="primary-btn" type="submit">Confirm Ride Request</button>' +
      '</form>' + activeBox + historyPreview()
    );
  }

  function calculateFare(defaultPickup, defaultDropoff) {
    const pickup = window.HopprUI.el('pickupLocation') ? window.HopprUI.el('pickupLocation').value : (defaultPickup || 'Kolej Tun Razak');
    const dropoff = window.HopprUI.el('dropoffLocation') ? window.HopprUI.el('dropoffLocation').value : (defaultDropoff || 'Faculty of Computing');
    const vehicleId = window.HopprUI.el('vehicleType') ? window.HopprUI.el('vehicleType').value : 'car';
    const tierId = window.HopprUI.el('rideTier') ? window.HopprUI.el('rideTier').value : 'standard';
    const vehicle = window.HopprData.vehicleTypes.find(function (v) { return v.id === vehicleId; }) || window.HopprData.vehicleTypes[1];
    const tier = window.HopprData.tiers.find(function (t) { return t.id === tierId; }) || window.HopprData.tiers[0];
    const distance = pickup === dropoff ? 0 : (1.4 + Math.abs(window.HopprData.locations.indexOf(pickup) - window.HopprData.locations.indexOf(dropoff)) * 0.28);
    const minutes = distance === 0 ? 0 : Math.ceil(distance * 4 + 2);
    const subtotal = (vehicle.base + minutes * vehicle.minute) * tier.multiplier;
    const fee = Math.max(0, subtotal);
    return { pickup: pickup, dropoff: dropoff, vehicle: vehicle, tier: tier, distance: distance, minutes: minutes, fee: fee };
  }

  function fareSummary(info) {
    const method = window.HopprUI.el('paymentMethod') ? window.HopprUI.paymentMethodLabel(window.HopprUI.el('paymentMethod').value) : 'Cash after completion';
    return window.HopprUI.summaryLine('Route', info.pickup + ' → ' + info.dropoff) +
      window.HopprUI.summaryLine('Vehicle / Tier', info.vehicle.label + ' / ' + info.tier.label) +
      window.HopprUI.summaryLine('Payment Method', method) +
      window.HopprUI.summaryLine('Distance / ETA', info.distance.toFixed(1) + ' km / ' + info.minutes + ' min') +
      window.HopprUI.summaryLine('Estimated Fare', window.HopprUI.money(info.fee), 'total');
  }

  function activeRideCard(ride) {
    return '<div class="list-card">' +
      '<div class="list-row"><div class="row-icon">🚗</div><div class="row-main"><strong>' + window.HopprUI.escape(ride.id) + '</strong><span>' + window.HopprUI.escape(ride.pickup) + ' → ' + window.HopprUI.escape(ride.dropoff) + '<br>Payment: ' + window.HopprUI.escape(ride.paymentMethod || 'Not selected') + '</span></div><span class="badge warning">' + window.HopprUI.escape(ride.status) + '</span></div>' +
      '<div style="padding:14px;" class="button-row"><button type="button" id="trackRide" class="secondary-btn">Track Ride</button><button type="button" id="payRide" class="primary-btn">Payment</button><button type="button" id="cancelRide" class="danger-btn">Cancel</button></div>' +
      '</div>';
  }

  function historyPreview() {
    return '<h3 class="section-title">Recent Service & Payment Records</h3><div class="list-card">' + window.HopprState.rideHistory.slice(0, 3).map(function (item) {
      return '<div class="list-row"><div class="row-icon">' + (item.type === 'Ride' ? '🚕' : item.type === 'Food' ? '🍱' : '📦') + '</div><div class="row-main"><strong>' + window.HopprUI.escape(item.id) + '</strong><span>' + window.HopprUI.escape(item.route) + '<br>' + window.HopprUI.escape(item.date) + '</span></div><span class="badge success">' + window.HopprUI.money(item.fare) + '</span></div>';
    }).join('') + '</div>';
  }

  function refreshRidePreview() {
    const info = calculateFare();
    const preview = window.HopprUI.el('farePreview');
    if (preview) preview.innerHTML = fareSummary(info);
  }

  function bindRide() {
    ['pickupLocation', 'dropoffLocation', 'vehicleType', 'rideTier', 'paymentMethod'].forEach(function (id) {
      const field = window.HopprUI.el(id);
      if (field) field.addEventListener('change', function () {
        window.HopprUI.toggleNewCardFields();
        refreshRidePreview();
      });
    });
    window.HopprUI.toggleNewCardFields();
    const form = window.HopprUI.el('rideForm');
    if (form) form.addEventListener('submit', function (event) {
      event.preventDefault();
      const info = calculateFare();
      if (info.pickup === info.dropoff) {
        window.HopprUI.toast('Pickup and destination cannot be the same.', 'danger');
        return;
      }
      const payment = window.HopprUI.collectPaymentDetails();
      if (!payment) return;
      const ride = {
        id: window.HopprUI.createId('R'), pickup: info.pickup, dropoff: info.dropoff,
        vehicle: info.vehicle.label, tier: info.tier.label, fee: info.fee,
        distance: info.distance.toFixed(1) + ' km', eta: info.minutes + ' min',
        driver: 'Tanzid Uddin', status: 'Driver Assigned', paid: false,
        paymentMethodId: payment.id, paymentMethod: payment.label, paymentType: payment.type
      };
      window.HopprState.activeRide = ride;
      window.HopprState.notifications.unshift('Ride ' + ride.id + ' assigned to ' + ride.driver + '. Payment selected: ' + ride.paymentMethod + '.');
      window.HopprUI.toast('Ride request confirmed. Payment method saved before request.', 'success');
      window.HopprRouter.go('rideTracking');
    });
    const track = window.HopprUI.el('trackRide');
    if (track) track.addEventListener('click', function () { window.HopprRouter.go('rideTracking'); });
    const pay = window.HopprUI.el('payRide');
    if (pay) pay.addEventListener('click', function () { openPaymentIfComplete(window.HopprState.activeRide, 'Ride'); });
    const cancel = window.HopprUI.el('cancelRide');
    if (cancel) cancel.addEventListener('click', function () {
      window.HopprState.activeRide = null;
      window.HopprUI.toast('Ride cancelled before driver arrival.', 'warning');
      window.HopprRouter.go('ride');
    });
  }

  function rideTrackingScreen() {
    const ride = window.HopprState.activeRide;
    if (!ride) return window.HopprUI.shell('Live Ride Tracking', 'No active ride is currently available.', '<div class="empty-card"><strong>No active ride</strong>Book a ride first to view tracking.</div>');
    const steps = ['Request Created', 'Driver Assigned', 'Driver Arriving', 'Trip Started', 'Completed'];
    const current = Math.max(0, steps.indexOf(ride.status));
    const paymentHint = ride.status === 'Completed' ? 'Payment can now be confirmed.' : 'Cash and QR payment are confirmed after completion.';
    return window.HopprUI.shell('Live Ride Tracking', 'Track the current ride status and confirm payment after the trip is completed.',
      '<div class="summary-card">' +
        window.HopprUI.summaryLine('Ride ID', ride.id) +
        window.HopprUI.summaryLine('Route', ride.pickup + ' → ' + ride.dropoff) +
        window.HopprUI.summaryLine('Driver', ride.driver) +
        window.HopprUI.summaryLine('Vehicle / Tier', ride.vehicle + ' / ' + ride.tier) +
        window.HopprUI.summaryLine('Payment Method', ride.paymentMethod || 'Not selected') +
        window.HopprUI.summaryLine('Fare', window.HopprUI.money(ride.fee), 'total') +
      '</div>' +
      window.HopprUI.timeline(steps, current) +
      '<div class="auth-prompt"><strong>Payment rule</strong><p class="help-text">' + paymentHint + '</p></div>' +
      '<div class="button-row"><button id="advanceRide" class="primary-btn" type="button">Next Status</button><button id="paymentFromTracking" class="secondary-btn" type="button">Payment</button></div>'
    );
  }

  function bindRideTracking() {
    const advance = window.HopprUI.el('advanceRide');
    if (advance) advance.addEventListener('click', function () {
      const steps = ['Request Created', 'Driver Assigned', 'Driver Arriving', 'Trip Started', 'Completed'];
      const ride = window.HopprState.activeRide;
      const current = Math.max(0, steps.indexOf(ride.status));
      const next = Math.min(current + 1, steps.length - 1);
      ride.status = steps[next];
      if (ride.status === 'Completed') {
        window.HopprState.rideHistory.unshift({ id: ride.id, type: 'Ride', route: ride.pickup + ' → ' + ride.dropoff, date: 'Today, just now', fare: ride.fee, status: 'Completed' });
        window.HopprUI.toast('Ride completed. You can now confirm payment.', 'success');
      } else {
        window.HopprUI.toast('Ride status updated: ' + ride.status, 'success');
      }
      window.HopprRouter.go('rideTracking');
    });
    const payment = window.HopprUI.el('paymentFromTracking');
    if (payment) payment.addEventListener('click', function () { openPaymentIfComplete(window.HopprState.activeRide, 'Ride'); });
  }

  function openPaymentIfComplete(record, type) {
    const isDone = record && (record.status === 'Completed' || record.status === 'Delivered');
    if (!isDone) {
      window.HopprUI.toast('Payment is confirmed after the ride or delivery is completed.', 'warning');
      return;
    }
    window.HopprState.pendingPayment = { serviceType: type || record.type || 'Service', record: record };
    window.HopprRouter.go('payment');
  }

  function paymentScreen() {
    const pending = window.HopprState.pendingPayment || (window.HopprState.activeRide ? { serviceType: 'Ride', record: window.HopprState.activeRide } : null) || (window.HopprState.activeDelivery ? { serviceType: 'Delivery', record: window.HopprState.activeDelivery } : null);
    const record = pending ? pending.record : { id: 'DEMO', pickup: 'Kolej Tun Razak', dropoff: 'Faculty of Computing', from: 'Kolej Tun Razak', to: 'Faculty of Computing', fee: 4.80, status: 'Completed', paymentMethodId: 'cash', paymentMethod: 'Cash after completion' };
    const pickup = record.pickup || record.from || 'Pickup';
    const dropoff = record.dropoff || record.to || 'Drop-off';
    return window.HopprUI.shell('Payment Confirmation', 'Confirm cash, QR or card payment after the service is completed.',
      '<div class="summary-card">' +
        window.HopprUI.summaryLine('Service', pending ? pending.serviceType : 'Demo Service') +
        window.HopprUI.summaryLine('Booking ID', record.id) +
        window.HopprUI.summaryLine('Route', pickup + ' → ' + dropoff) +
        window.HopprUI.summaryLine('Selected Method', record.paymentMethod || window.HopprUI.paymentMethodLabel(record.paymentMethodId || 'cash')) +
        window.HopprUI.summaryLine('Service Fee', window.HopprUI.money(record.fee), 'total') +
      '</div>' +
      '<form id="paymentForm" class="form-card">' +
        window.HopprUI.paymentSelector(record.paymentMethodId || 'cash') +
        '<button class="primary-btn" type="submit">Confirm Payment</button>' +
      '</form>'
    );
  }

  function bindPayment() {
    const method = window.HopprUI.el('paymentMethod');
    if (method) method.addEventListener('change', window.HopprUI.toggleNewCardFields);
    window.HopprUI.toggleNewCardFields();
    const form = window.HopprUI.el('paymentForm');
    if (form) form.addEventListener('submit', function (event) {
      event.preventDefault();
      const payment = window.HopprUI.collectPaymentDetails();
      if (!payment) return;
      const pending = window.HopprState.pendingPayment;
      if (pending && pending.record) {
        pending.record.paymentMethodId = payment.id;
        pending.record.paymentMethod = payment.label;
        pending.record.paid = true;
      }
      if (window.HopprState.activeRide && (!pending || pending.record === window.HopprState.activeRide)) window.HopprState.activeRide.paid = true;
      window.HopprUI.toast('Payment recorded successfully using ' + payment.label + '.', 'success');
      window.HopprState.pendingPayment = null;
      window.HopprRouter.go('history');
    });
  }

  function historyScreen() {
    const title = window.HopprUI.isDriver() ? 'Earnings History' : 'Service History';
    const subtitle = window.HopprUI.isDriver() ? 'Completed driver jobs and earnings records.' : 'Completed rides, food orders, parcel deliveries and payment records.';
    return window.HopprUI.shell(title, subtitle, historyPreview());
  }

  window.HopprPayment = { openIfComplete: openPaymentIfComplete };
  window.HopprRouter.register('ride', rideScreen);
  window.HopprRouter.register('rideTracking', rideTrackingScreen);
  window.HopprRouter.register('payment', paymentScreen);
  window.HopprRouter.register('history', historyScreen);
  window.HopprBinders.ride = bindRide;
  window.HopprBinders.rideTracking = bindRideTracking;
  window.HopprBinders.payment = bindPayment;
})();
