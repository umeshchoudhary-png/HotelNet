const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const vlans = [
  { id: 10, department: "Reception", subnet: "192.168.10.0/24", gateway: "192.168.10.1", color: "#47b8ff" },
  { id: 20, department: "Administration", subnet: "192.168.20.0/24", gateway: "192.168.20.1", color: "#34d399" },
  { id: 30, department: "Staff", subnet: "192.168.30.0/24", gateway: "192.168.30.1", color: "#fbbf24" },
  { id: 40, department: "Guests", subnet: "192.168.40.0/24", gateway: "192.168.40.1", color: "#fb7185" }
];

let devices = [
  { id: 1, name: "Reception-PC-01", type: "Desktop", vlan: 10, ip: "192.168.10.2", connection: "Wired", status: "Online", mac: "02:10:00:00:00:01" },
  { id: 2, name: "Reception-PC-02", type: "Desktop", vlan: 10, ip: "192.168.10.3", connection: "Wired", status: "Online", mac: "02:10:00:00:00:02" },
  { id: 3, name: "Admin-PC-01", type: "Desktop", vlan: 20, ip: "192.168.20.2", connection: "Wired", status: "Online", mac: "02:20:00:00:00:01" },
  { id: 4, name: "Staff-Laptop-01", type: "Laptop", vlan: 30, ip: "192.168.30.2", connection: "Wi-Fi", status: "Online", mac: "02:30:00:00:00:01" },
  { id: 5, name: "Staff-Mobile-01", type: "Mobile", vlan: 30, ip: "192.168.30.3", connection: "Wi-Fi", status: "Online", mac: "02:30:00:00:00:02" },
  { id: 6, name: "Guest-Laptop-01", type: "Laptop", vlan: 40, ip: "192.168.40.2", connection: "Wi-Fi", status: "Online", mac: "02:40:00:00:00:01" },
  { id: 7, name: "Guest-Mobile-01", type: "Mobile", vlan: 40, ip: "192.168.40.3", connection: "Wi-Fi", status: "Online", mac: "02:40:00:00:00:02" }
];
let nextId = 8;
let nextHost = { 10: 4, 20: 3, 30: 4, 40: 4 };
const logs = [
  { time: new Date().toLocaleTimeString(), type: "SYSTEM", message: "HotelNet simulation initialized" },
  { time: new Date().toLocaleTimeString(), type: "DHCP", message: "7 demo clients loaded with simulated leases" }
];

function log(type, message) {
  logs.unshift({ time: new Date().toLocaleTimeString(), type, message });
  if (logs.length > 30) logs.pop();
}
function getVlan(id) { return vlans.find(v => v.id === Number(id)); }

app.get("/api/overview", (req, res) => {
  res.json({
    vlans,
    devices,
    logs: logs.slice(0, 8),
    stats: {
      totalDevices: devices.length,
      activeVlans: vlans.length,
      dhcpLeases: devices.filter(d => d.ip).length,
      wirelessClients: devices.filter(d => d.connection === "Wi-Fi").length,
      onlineDevices: devices.filter(d => d.status === "Online").length
    }
  });
});

app.post("/api/dhcp/assign", (req, res) => {
  const vlanId = Number(req.body.vlan);
  const vlan = getVlan(vlanId);
  if (!vlan) return res.status(400).json({ error: "Choose a valid VLAN." });
  const host = nextHost[vlanId]++;
  if (host > 250) { nextHost[vlanId] = 250; return res.status(409).json({ error: "Demo DHCP pool is full." }); }
  const device = {
    id: nextId++, name: `${vlan.department.replace(/[^A-Za-z]/g, "")}-Client-${String(host - 1).padStart(2, "0")}`,
    type: req.body.type || "Laptop", vlan: vlanId, ip: `192.168.${vlanId}.${host}`,
    connection: req.body.connection || (vlanId >= 30 ? "Wi-Fi" : "Wired"),
    status: "Online", mac: `02:${vlanId.toString(16).padStart(2,"0")}:00:00:${(host >> 8).toString(16).padStart(2,"0")}:${(host & 255).toString(16).padStart(2,"0")}`
  };
  devices.push(device);
  log("DHCP", `Lease assigned: ${device.ip} → ${device.name} (VLAN ${vlanId})`);
  res.json({ device, message: `Assigned ${device.ip} to ${device.name}` });
});

app.post("/api/test-connectivity", (req, res) => {
  const source = devices.find(d => d.id === Number(req.body.sourceId));
  const destination = devices.find(d => d.id === Number(req.body.destinationId));
  if (!source || !destination) return res.status(400).json({ error: "Select valid source and destination devices." });
  const sameVlan = source.vlan === destination.vlan;
  const guestBlocked = (source.vlan === 40 && destination.vlan !== 40) ||
                       (destination.vlan === 40 && source.vlan !== 40);
  const allowed = sameVlan || !guestBlocked;
  const result = {
    source: source.name, destination: destination.name,
    sourceIp: source.ip, destinationIp: destination.ip,
    status: allowed ? "PASS" : "BLOCKED",
    message: allowed
      ? (sameVlan ? "Devices are in the same VLAN. Simulated connectivity allowed." : "Inter-department routing is permitted by the demo policy.")
      : "Guest isolation policy blocks communication between Guest VLAN 40 and this department.",
    simulated: true
  };
  log("TEST", `${result.status}: ${source.name} → ${destination.name}`);
  res.json(result);
});

app.post("/api/devices/:id/toggle", (req, res) => {
  const device = devices.find(d => d.id === Number(req.params.id));
  if (!device) return res.status(404).json({ error: "Device not found." });
  device.status = device.status === "Online" ? "Offline" : "Online";
  log("DEVICE", `${device.name} set to ${device.status}`);
  res.json({ device });
});

app.get("/api/report.csv", (req, res) => {
  const rows = [["Device Name","Type","VLAN","IP Address","Connection","Status","MAC Address"]];
  devices.forEach(d => rows.push([d.name,d.type,d.vlan,d.ip,d.connection,d.status,d.mac]));
  const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g,'""')}"`).join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="hotelnet-devices.csv"');
  res.send(csv);
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`HotelNet running at http://localhost:${PORT}`));
