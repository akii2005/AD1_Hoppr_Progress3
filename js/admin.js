(function () {
  function adminScreen() {
    if (!window.HopprUI.requireUser()) return '';
    const activeRides = (window.HopprState.activeRide ? 1 : 0) + window.HopprState.deliveryOrders.filter(function (o) { return o.status !== 'Delivered'; }).length;
    return window.HopprUI.shell('Admin Monitoring', 'Verify users, monitor ride and delivery activities, review complaints and suspend unsafe accounts.',
      '<div class="grid-3">' +
        '<div class="metric-card"><span>Users</span><strong>' + window.HopprState.adminUsers.length + '</strong><small>Registered accounts</small></div>' +
        '<div class="metric-card"><span>Active Jobs</span><strong>' + activeRides + '</strong><small>Ride / delivery</small></div>' +
        '<div class="metric-card"><span>Reports</span><strong>' + window.HopprData.complaints.length + '</strong><small>Open complaints</small></div>' +
      '</div>' +
      '<h3 class="section-title">Student Account Verification</h3>' + userList() +
      '<h3 class="section-title">Activity Monitoring</h3>' + activityList() +
      '<h3 class="section-title">Complaints and Reports</h3>' + complaintList()
    );
  }

  function userList() {
    return '<div class="list-card">' + window.HopprState.adminUsers.map(function (user) {
      const verifiedClass = user.verified ? 'success' : 'warning';
      const actions = user.verified ? '<button type="button" class="danger-btn suspend-user" data-id="' + user.id + '">Suspend</button>' : '<button type="button" class="secondary-btn verify-user" data-id="' + user.id + '">Approve</button>';
      return '<div class="list-row"><div class="avatar">' + window.HopprUI.escape(user.name.charAt(0)) + '</div><div class="row-main"><strong>' + window.HopprUI.escape(user.name) + '</strong><span>' + window.HopprUI.escape(user.email) + '<br>' + window.HopprUI.escape(user.role) + '</span></div><div style="display:grid;gap:8px;justify-items:end;"><span class="badge ' + verifiedClass + '">' + (user.verified ? 'Verified' : 'Pending') + '</span>' + actions + '</div></div>';
    }).join('') + '</div>';
  }

  function activityList() {
    const activeRide = window.HopprState.activeRide ? [{ id: window.HopprState.activeRide.id, type: 'Ride', from: window.HopprState.activeRide.pickup, to: window.HopprState.activeRide.dropoff, status: window.HopprState.activeRide.status }] : [];
    const deliveries = window.HopprState.deliveryOrders.map(function (order) { return { id: order.id, type: order.type, from: order.from, to: order.to, status: order.status }; });
    const activities = activeRide.concat(deliveries).slice(0, 5);
    if (!activities.length) return '<div class="empty-card"><strong>No active records</strong>New ride and delivery activities will appear here for monitoring.</div>';
    return '<div class="list-card">' + activities.map(function (item) {
      return '<div class="list-row"><div class="row-icon">' + (item.type === 'Ride' ? '🚕' : item.type === 'Food' ? '🍱' : '📦') + '</div><div class="row-main"><strong>' + window.HopprUI.escape(item.id) + ' · ' + window.HopprUI.escape(item.type) + '</strong><span>' + window.HopprUI.escape(item.from) + ' → ' + window.HopprUI.escape(item.to) + '</span></div><span class="badge warning">' + window.HopprUI.escape(item.status) + '</span></div>';
    }).join('') + '</div>';
  }

  function complaintList() {
    return '<div class="list-card">' + window.HopprData.complaints.map(function (item) {
      return '<div class="list-row"><div class="row-icon">!</div><div class="row-main"><strong>' + window.HopprUI.escape(item.id) + ' · ' + window.HopprUI.escape(item.priority) + '</strong><span>' + window.HopprUI.escape(item.user) + ': ' + window.HopprUI.escape(item.issue) + '</span></div><span class="badge ' + (item.status === 'Open' ? 'danger' : 'warning') + '">' + window.HopprUI.escape(item.status) + '</span></div>';
    }).join('') + '</div>';
  }

  function bindAdmin() {
    window.HopprUI.qsa('.verify-user').forEach(function (button) {
      button.addEventListener('click', function () {
        const id = Number(button.getAttribute('data-id'));
        const user = window.HopprState.adminUsers.find(function (u) { return u.id === id; });
        if (user) {
          user.verified = true;
          user.status = 'Active';
          window.HopprUI.toast('User account approved.', 'success');
          window.HopprRouter.go('admin');
        }
      });
    });
    window.HopprUI.qsa('.suspend-user').forEach(function (button) {
      button.addEventListener('click', function () {
        const id = Number(button.getAttribute('data-id'));
        const user = window.HopprState.adminUsers.find(function (u) { return u.id === id; });
        if (user) {
          user.status = 'Suspended';
          user.verified = false;
          window.HopprUI.toast('Account suspended for review.', 'warning');
          window.HopprRouter.go('admin');
        }
      });
    });
  }

  window.HopprRouter.register('admin', adminScreen);
  window.HopprBinders.admin = bindAdmin;
})();
