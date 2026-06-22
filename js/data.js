(function () {
  window.HopprData = {
    appName: 'Hoppr',
    projectTitle: 'UTM Ride Hailing App',
    team: [
      { name: 'Tanzid Uddin', matric: 'A24CS4035' },
      { name: 'Ahmed Kamal Ibrahim', matric: 'A24CS4004' }
    ],
    locations: [
      'Kolej Tun Razak',
      'Kolej Rahman Putra',
      'Kolej Tuanku Canselor',
      'Faculty of Computing',
      'UTM Library',
      'ArkED Meranti Food Court',
      'UTM Health Centre',
      'Dewan Sultan Iskandar',
      'Sports Centre',
      'Kolej 9 & 10'
    ],
    campusPlaces: {
      'Kolej Tun Razak': { x: 18, y: 70, short: 'KTR' },
      'Kolej Rahman Putra': { x: 23, y: 28, short: 'KRP' },
      'Kolej Tuanku Canselor': { x: 34, y: 86, short: 'KTC' },
      'Faculty of Computing': { x: 74, y: 32, short: 'FC' },
      'UTM Library': { x: 55, y: 44, short: 'Library' },
      'ArkED Meranti Food Court': { x: 58, y: 76, short: 'ArkED' },
      'UTM Health Centre': { x: 80, y: 62, short: 'Health' },
      'Dewan Sultan Iskandar': { x: 43, y: 56, short: 'DSI' },
      'Sports Centre': { x: 84, y: 84, short: 'Sports' },
      'Kolej 9 & 10': { x: 16, y: 44, short: 'K9/K10' }
    },
    exampleRoutes: [
      { id: 'campus-core', name: 'KTR → Faculty of Computing', from: 'Kolej Tun Razak', to: 'Faculty of Computing', distance: '2.1 km', eta: '6 min', fare: 4.80 },
      { id: 'library-food', name: 'UTM Library → ArkED Meranti', from: 'UTM Library', to: 'ArkED Meranti Food Court', distance: '1.3 km', eta: '4 min', fare: 3.60 },
      { id: 'hostel-health', name: 'Kolej 9 & 10 → Health Centre', from: 'Kolej 9 & 10', to: 'UTM Health Centre', distance: '2.7 km', eta: '8 min', fare: 5.20 },
      { id: 'sport-college', name: 'Sports Centre → KRP', from: 'Sports Centre', to: 'Kolej Rahman Putra', distance: '3.0 km', eta: '9 min', fare: 5.60 }
    ],
    vendors: [
      'ArkED Meranti Food Court',
      'Kolej Tun Razak Cafe',
      'Cengal Cafeteria',
      'Kolej 9 Food Court',
      'Faculty of Computing Kiosk'
    ],
    vehicleTypes: [
      { id: 'bike', label: 'Bike', base: 1.2, minute: 0.16, note: 'Fast low-cost campus rides' },
      { id: 'car', label: 'Car', base: 2.5, minute: 0.22, note: 'Comfortable for longer campus trips' }
    ],
    tiers: [
      { id: 'standard', label: 'Standard', multiplier: 1.0, note: 'Affordable student fare' },
      { id: 'express', label: 'Express', multiplier: 1.25, note: 'Priority nearby driver' },
      { id: 'night-safe', label: 'Night Safe', multiplier: 1.4, note: 'Extra trusted late-night option' }
    ],
    paymentMethods: [
      { id: 'cash', label: 'Cash after completion', type: 'post', note: 'Pay the driver after the ride or delivery is completed.' },
      { id: 'qr', label: 'QR Pay after completion', type: 'post', note: 'Scan the QR code after the service is completed.' },
      { id: 'new-card', label: '+ Add new bank card', type: 'new-card', note: 'Register a new card for future orders.' }
    ],
    savedCards: [
      { id: 'card-visa-2468', brand: 'Visa', last4: '2468', holder: 'Ahmed Kamal', expiry: '08/28' },
      { id: 'card-master-8921', brand: 'Mastercard', last4: '8921', holder: 'Ahmed Kamal', expiry: '12/27' }
    ],
    users: [
      {
        id: 1,
        name: 'Ahmad Bin Abdullah',
        email: 'student@student.utm.my',
        password: 'Password123',
        role: 'Student Passenger',
        phone: '+60 11 3456 7890',
        faculty: 'Faculty of Computing',
        degree: 'Bachelor of Computer Science',
        verified: true,
        status: 'Active'
      },
      {
        id: 2,
        name: 'Tanzid Uddin',
        email: 'driver@student.utm.my',
        password: 'Password123',
        role: 'Student Driver',
        phone: '+60 12 222 2045',
        faculty: 'Faculty of Computing',
        degree: 'Bachelor of Computer Science',
        verified: true,
        status: 'Active',
        vehicle: 'Perodua Myvi - JSR 2405'
      },
      {
        id: 3,
        name: 'Admin Supervisor',
        email: 'admin@utm.my',
        password: 'Password123',
        role: 'Admin',
        phone: '+60 7 555 0190',
        faculty: 'Faculty of Computing',
        degree: 'System Management',
        verified: true,
        status: 'Active'
      }
    ],
    sampleJobs: [
      { id: 'R-1206', type: 'Ride', passenger: 'Aina Sofea', pickup: 'Kolej Tun Razak', dropoff: 'Faculty of Computing', fare: 4.8, distance: '2.1 km', eta: '6 min', status: 'Waiting' },
      { id: 'P-2204', type: 'Parcel', passenger: 'Muhammad Hafiz', pickup: 'UTM Library', dropoff: 'Kolej Rahman Putra', fare: 3.7, distance: '1.8 km', eta: '6 min', status: 'Waiting' },
      { id: 'F-3321', type: 'Food', passenger: 'Nur Alya', pickup: 'ArkED Meranti Food Court', dropoff: 'Kolej 9 & 10', fare: 5.2, distance: '2.7 km', eta: '8 min', status: 'Waiting' }
    ],
    complaints: [
      { id: 'C-1007', user: 'Student Passenger', issue: 'Driver arrived late', priority: 'Medium', status: 'Open' },
      { id: 'C-1010', user: 'Driver', issue: 'Passenger cancelled after arrival', priority: 'Low', status: 'Reviewing' }
    ]
  };
})();
