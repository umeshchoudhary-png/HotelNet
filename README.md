# HotelNet — Hotel Network Management System

An educational Computer Networks mini-project built with Node.js, Express, HTML, CSS and JavaScript.

## Features
- Professional responsive dashboard UI
- Four logical VLANs: Reception (10), Administration (20), Staff (30), Guests (40)
- DHCP-style IP allocation simulation
- Wired and wireless client registry
- Connectivity policy tests including guest isolation
- Device status toggles and CSV export
- Activity log

## Important scope note
This is a **software-level network simulation**. It does not configure physical switches, router interfaces, a real DHCP service, or actual Wi-Fi access points. Report results only after running and checking the corresponding feature.

## Requirements
- Node.js 18 or newer
- npm

## Run locally
1. Open this folder in VS Code.
2. Open Terminal → New Terminal.
3. Run `npm install`
4. Run `npm start`
5. Open `http://localhost:3000` in your browser.

Stop the server with `Ctrl+C`.

## Demonstration checklist
1. Open Overview and show the four VLANs and device summary.
2. Open VLAN Management and explain each subnet and gateway.
3. Open DHCP Leases, choose a VLAN and click **Assign demo IP**.
4. Open Wireless Clients and show the simulated staff/guest clients.
5. Open Connectivity Tests:
   - Same VLAN devices → expected PASS.
   - Guest VLAN 40 and non-guest VLAN → expected BLOCKED.
6. Export the device table using **Export CSV**.
7. Capture screenshots of the actual running application.

## Address plan
| VLAN | Department | Subnet | Gateway |
|---|---|---|---|
| 10 | Reception | 192.168.10.0/24 | 192.168.10.1 |
| 20 | Administration | 192.168.20.0/24 | 192.168.20.1 |
| 30 | Staff | 192.168.30.0/24 | 192.168.30.1 |
| 40 | Guests | 192.168.40.0/24 | 192.168.40.1 |

## Submission
Submit the complete source folder or ZIP if accepted by the course, along with the report PDF and genuine screenshots. Confirm your faculty's required format before final submission.


## Deploy a public demo link (Render)

This project is configured for Render using `render.yaml`.

1. Create a new **public** repository on GitHub, for example `HotelNet`.
2. Upload the contents of this folder to the repository root (so `package.json`, `server.js`, `render.yaml`, and `public/` are at the top level).
3. Open https://dashboard.render.com/ and sign in.
4. Choose **New + → Blueprint** (or connect the GitHub repo as a Web Service).
5. Select the repository. If using Blueprint, Render reads `render.yaml`; review the service and choose the Free plan, then apply.
6. Wait for the deploy to finish. Render will show a URL similar to `https://hotelnet-demo.onrender.com`. Use the exact URL shown in your dashboard; it cannot be predicted in advance.
7. Open the URL in a private/incognito browser to verify it loads, then test each page before putting the URL in the report.

### Important demo notes
- A free Render web service may sleep after 15 minutes without traffic. The first visit after sleeping can take about a minute to wake it up.
- Demo devices and changes are held in memory. A restart/redeploy can restore the sample data, and new simulated assignments may not persist.
- This is an educational web simulation, not a real hotel router, switch, DHCP server, or wireless access point.
