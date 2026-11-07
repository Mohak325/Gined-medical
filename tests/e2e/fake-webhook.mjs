// A throwaway leads webhook for the booking tests: POST /hook stores a lead, GET /received lists them.
import http from "node:http";

const leads = [];
http
  .createServer((req, res) => {
    if (req.method === "POST" && req.url === "/hook") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        leads.push(JSON.parse(body));
        res.end("ok");
      });
      return;
    }
    if (req.url === "/received") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(leads));
      return;
    }
    res.statusCode = 404;
    res.end();
  })
  .listen(3201);
