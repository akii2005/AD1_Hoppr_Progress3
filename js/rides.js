(function () {
  function rideScreen(params) {
    const selected = params.exampleRoute ? window.HopprData.exampleRoutes.find(function (route) { return route.id === params.exampleRoute; }) : null;
    const from = selected ? selected.from : 'Kolej Tun Razak';
    const to = selected ? selected.to : 'Faculty of Computing';
    const active = window.HopprState.activeRide;
    const activeBox = active ? activeRideCard(active) : '<div class="empty-card"><strong>No active ride</strong>Book a ride to generate a fare estimate, driver assignment and tracking timeline.</div>';
    return window.HopprUI.shell('Ride Booking', 'Book campus rides, view fare estimate, confirm payment and track driver location in real time.',
      '<div id="routeMap">' + window.HopprUI.map('UTM Ride Route Map', from + ' → ' + to, from, to) + '</div>' +
      '<h3 class="section-title">Example UTM Routes</h3>' + window.HopprUI.exampleRoutes(4) +
      '<form id="rideForm" class="form-card">' +
        window.HopprUI.select('pickupLocation', 'Pickup Location', window.HopprData.locations, from) +
        window.HopprUI.select('dropoffLocation', 'Destination', window.HopprData.locations, to) +
        '<div class="grid-2">' + window.HopprUI.select('vehicleType', 'Vehicle Type', window.HopprData.vehicleTypes, 'car') + window.HopprUI.select('rideTier', 'Service Tier', window.HopprData.tiers, 'standard') + '</div>' +
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
    return window.HopprUI.summaryLine('Route', info.pickup + ' → ' + info.dropoff) +
      window.HopprUI.summaryLine('Vehicle / Tier', info.vehicle.label + ' / ' + info.tier.label) +
      window.HopprUI.summaryLine('Distance / ETA', info.distance.toFixed(1) + ' km / ' + info.minutes + ' min') +
      window.HopprUI.summaryLine('Estimated Fare', window.HopprUI.money(info.fee), 'total');
  }

  function activeRideCard(ride) {
    return '<div class="list-card">' +
      '<div class="list-row"><div class="row-icon">🚗</div><div class="row-main"><strong>' + window.HopprUI.escape(ride.id) + '</strong><span>' + window.HopprUI.escape(ride.pickup) + ' → ' + window.HopprUI.escape(ride.dropoff) + '</span></div><span class="badge warning">' + window.HopprUI.escape(ride.status) + '</span></div>' +
      '<div style="padding:14px;" class="button-row"><button type="button" id="trackRide" class="secondary-btn">Track Ride</button><button type="button" id="payRide" class="primary-btn">Pay Fare</button><button type="button" id="cancelRide" class="danger-btn">Cancel</button></div>' +
      '</div>';
  }

  function historyPreview() {
    return '<h3 class="section-title">Recent Ride & Payment Records</h3><div class="list-card">' + window.HopprState.rideHistory.slice(0, 3).map(function (item) {
      return '<div class="list-row"><div class="row-icon">' + (item.type === 'Ride' ? '🚕' : item.type === 'Food' ? '🍱' : '📦') + '</div><div class="row-main"><strong>' + window.HopprUI.escape(item.id) + '</strong><span>' + window.HopprUI.escape(item.route) + '<br>' + window.HopprUI.escape(item.date) + '</span></div><span class="badge success">' + window.HopprUI.money(item.fare) + '</span></div>';
    }).join('') + '</div>';
  }

  function refreshRidePreview() {
    const info = calculateFare();
    const preview = window.HopprUI.el('farePreview');
    const routeMap = window.HopprUI.el('routeMap');
    if (preview) preview.innerHTML = fareSummary(info);
    if (routeMap) routeMap.innerHTML = window.HopprUI.map('UTM Ride Route Map', info.pickup + ' → ' + info.dropoff, info.pickup, info.dropoff);
  }

  function bindRide() {
    ['pickupLocation', 'dropoffLocation', 'vehicleType', 'rideTier'].forEach(function (id) {
      const field = window.HopprUI.el(id);
      if (field) field.addEventListener('change', refreshRidePreview);
    });
    window.HopprUI.qsa('[data-example-route]').forEach(function (button) {
      button.addEventListener('click', function () {
        const route = window.HopprData.exampleRoutes.find(function (item) { return item.id === button.getAttribute('data-example-route'); });
        if (route) {
          window.HopprUI.el('pickupLocation').value = route.from;
          window.HopprUI.el('dropoffLocation').value = route.to;
          refreshRidePreview();
          window.HopprUI.toast('Example route selected: ' + route.name, 'success');
        }
      });
    });
    const form = window.HopprUI.el('rideForm');
    if (form) form.addEventListener('submit', function (event) {
      event.preventDefault();
      const info = calculateFare();
      if (info.pickup === info.dropoff) {
        window.HopprUI.toast('Pickup and destination cannot be the same.', 'danger');
        return;
      }
      const ride = {
        id: window.HopprUI.createId('R'), pickup: info.pickup, dropoff: info.dropoff,
        vehicle: info.vehicle.label, tier: info.tier.label, fee: info.fee,
        distance: info.distance.toFixed(1) + ' km', eta: info.minutes + ' min',
        driver: 'Tanzid Uddin', status: 'Driver Assigned', paid: false
      };
      window.HopprState.activeRide = ride;
      window.HopprState.notifications.unshift('Ride ' + ride.id + ' assigned to ' + ride.driver + '.');
      window.HopprUI.toast('Ride request confirmed and sent to nearby drivers.', 'success');
      window.HopprRouter.go('rideTracking');
    });
    const track = window.HopprUI.el('trackRide');
    if (track) track.addEventListener('click', function () { window.HopprRouter.go('rideTracking'); });
    const pay = window.HopprUI.el('payRide');
    if (pay) pay.addEventListener('click', function () { window.HopprRouter.go('payment'); });
    const cancel = window.HopprUI.el('cancelRide');
    if (cancel) cancel.addEventListener('click', function () {
      window.HopprState.activeRide = null;
      window.HopprUI.toast('Ride cancelled before driver arrival.', 'warning');
      window.HopprRouter.go('ride');
    });
  }

  function rideTrackingScreen() {
    const ride = window.HopprState.activeRide;
    if (!ride) {
      return window.HopprUI.shell(
        'Live Ride Tracking',
        'No active ride is currently available.',
        '<div class="empty-card"><strong>No active ride</strong>Book a ride first to view tracking.</div>'
      );
    }

    const steps = ['Request Created', 'Driver Assigned', 'Driver Arriving', 'Trip Started', 'Completed'];
    const current = Math.max(0, steps.indexOf(ride.status));
    const showMap = ['Driver Arriving', 'Trip Started', 'Completed'].indexOf(ride.status) !== -1;

    const mapSection = showMap
      ? window.HopprUI.map(
          'Driver location on UTM map',
          ride.driver + ' is heading from ' + ride.pickup + ' to ' + ride.dropoff,
          ride.pickup,
          ride.dropoff
        )
      : '<div class="empty-card"><strong>Map not available yet</strong>The map will appear when the driver starts arriving.</div>';

    return window.HopprUI.shell('Live Ride Tracking', 'Real-time driver visibility and trip status for the passenger.',
      mapSection +
      '<div class="summary-card">' +
        window.HopprUI.summaryLine('Ride ID', ride.id) +
        window.HopprUI.summaryLine('Driver', ride.driver) +
        window.HopprUI.summaryLine('Vehicle / Tier', ride.vehicle + ' / ' + ride.tier) +
        window.HopprUI.summaryLine('Fare', window.HopprUI.money(ride.fee), 'total') +
      '</div>' +
      window.HopprUI.timeline(steps, current) +
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
        window.HopprUI.toast('Ride completed. Payment confirmation is ready.', 'success');
      } else {
        window.HopprUI.toast('Ride status updated: ' + ride.status, 'success');
      }
      window.HopprRouter.go('rideTracking');
    });
    const payment = window.HopprUI.el('paymentFromTracking');
    if (payment) payment.addEventListener('click', function () { window.HopprRouter.go('payment'); });
  }

  function paymentScreen() {
    const ride = window.HopprState.activeRide || { id: 'R-DEMO', pickup: 'Kolej Tun Razak', dropoff: 'Faculty of Computing', fee: 4.8, status: 'Completed' };
    return window.HopprUI.shell('Payment and Fare Summary', 'Display fare summary and record payment confirmation after ride or delivery completion.',
      '<div class="summary-card">' +
        window.HopprUI.summaryLine('Booking ID', ride.id) +
        window.HopprUI.summaryLine('Pickup', ride.pickup) +
        window.HopprUI.summaryLine('Drop-off', ride.dropoff) +
        window.HopprUI.summaryLine('Service Fee', window.HopprUI.money(ride.fee), 'total') +
      '</div>' +
      '<form id="paymentForm" class="form-card">' +
        window.HopprUI.select('paymentMethod', 'Payment Method', ['Cash', 'E-Wallet', 'Debit/Credit Card'], 'Cash') +
        '<button class="primary-btn" type="submit">Confirm Payment</button>' +
      '</form>'
    );
  }

  function bindPayment() {
    const form = window.HopprUI.el('paymentForm');
    if (form) form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (window.HopprState.activeRide) window.HopprState.activeRide.paid = true;
      window.HopprUI.toast('Payment recorded successfully.', 'success');
      window.HopprRouter.go('history');
    });
  }

  function historyScreen() {
    const title = window.HopprUI.isDriver() ? 'Earnings History' : 'Service History';
    const subtitle = window.HopprUI.isDriver() ? 'Completed driver jobs and earnings records.' : 'Completed rides, food orders, parcel deliveries and payment records.';
    return window.HopprUI.shell(title, subtitle, historyPreview());
  }

  window.HopprRouter.register('ride', rideScreen);
  window.HopprRouter.register('rideTracking', rideTrackingScreen);
  window.HopprRouter.register('payment', paymentScreen);
  window.HopprRouter.register('history', historyScreen);
  window.HopprBinders.ride = bindRide;
  window.HopprBinders.rideTracking = bindRideTracking;
  window.HopprBinders.payment = bindPayment;
})();
