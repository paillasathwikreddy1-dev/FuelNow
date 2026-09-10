import http from "http";

const routes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/dashboard",
  "/request",
  "/tracking",
  "/my-requests",
  "/saved-locations",
  "/notifications",
  "/profile",
  "/help",
  "/rider",
  "/station",
  "/admin"
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${route}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          route,
          status: res.statusCode,
          hasRoot: data.includes('id="root"'),
          titleMatch: data.includes("FuelNow"),
        });
      });
    }).on("error", (err) => {
      resolve({ route, error: err.message });
    });
  });
}

async function run() {
  console.log("Verifying all FuelNow routes on http://localhost:3000...");
  for (const r of routes) {
    const res = await checkRoute(r);
    console.log(`Route [${r}]: Status ${res.status} | HTML root: ${res.hasRoot} | Title FuelNow: ${res.titleMatch}`);
  }
}

run();
