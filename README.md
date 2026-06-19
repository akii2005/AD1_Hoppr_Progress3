# Hoppr — Progress 3 Frontend UI

High-fidelity frontend UI prototype for **UTM Ride Hailing App / Hoppr**.

This version is prepared for Progress 3 submission and GitHub Pages. It uses only **HTML, CSS and JavaScript** and can run by opening `index.html` or through GitHub Pages.

## Main Improvements

- Public welcome home screen with Hoppr logo, app intro, Login and Sign Up buttons.
- Protected screens: clicking Ride, Delivery, Driver, Admin or Profile without login opens a sign-in prompt.
- Demo accounts are clickable and auto-fill the login form.
- Role-based navigation:
  - Student Passenger sees Ride, Delivery, History and Profile only.
  - Student Driver sees Driver Jobs, Earnings and Profile only.
  - Admin sees Admin Monitor and Profile only.
- Driver screens are hidden from student passenger users.
- UTM campus map prototype added with example routes.
- Example routes can be selected inside Ride Booking to update pickup, destination, map and fare preview.
- Submission coverage section removed from the UI.

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Student Passenger | `student@student.utm.my` | `Password123` |
| Student Driver | `driver@student.utm.my` | `Password123` |
| Admin | `admin@utm.my` | `Password123` |

## Module to Frontend Script Mapping

| Module | Frontend Script |
|---|---|
| Main App, Welcome Screen and Role Navigation | [`js/app.js`](js/app.js) |
| Route Control and Protected Screens | [`js/router.js`](js/router.js) |
| Shared UI Helpers, UTM Map, Role Rules | [`js/utils.js`](js/utils.js) |
| Demo Data, UTM Locations and Example Routes | [`js/data.js`](js/data.js) |
| Login, Sign Up, Reset Password and Verification | [`js/auth.js`](js/auth.js) |
| Profile, Settings and Logout | [`js/profile.js`](js/profile.js) |
| Ride Booking, Fare Estimate, Tracking and Payment | [`js/rides.js`](js/rides.js) |
| Parcel and Food Delivery | [`js/delivery.js`](js/delivery.js) |
| Driver Jobs, Trip Execution and Earnings | [`js/driver.js`](js/driver.js) |
| Admin Monitoring, Verification and Reports | [`js/admin.js`](js/admin.js) |
| Visual Design and Responsive UI | [`css/styles.css`](css/styles.css) |

## How to Upload to GitHub Pages

1. Create a GitHub repository.
2. Upload the folder contents directly so the repository root contains:
   - `index.html`
   - `README.md`
   - `assets/`
   - `css/`
   - `js/`
   - `docs/`
3. Go to **Settings > Pages**.
4. Select **Branch: main** and **Folder: /root**.
5. Save and open the generated GitHub Pages link.

## Progress 3 Submission Links

Paste your final links here before submitting:

- GitHub Repository: `https://github.com/akii2005/AD1_Hoppr_Progress3.git`
- GitHub Pages Live UI: `https://akii2005.github.io/AD1_Hoppr_Progress3/`
- Video Link: `https://drive.google.com/file/d/1WtZBM5CB0G5-5VU_3qCzx6PVRu3n-pbt/view?usp=sharing`
- Trello Board Link: `https://trello.com/invite/b/69dd8f20eab6b6a119a6acee/ATTI2b025cbf52666f96b164ab163e45955c516DCFCA/alphahopper`
