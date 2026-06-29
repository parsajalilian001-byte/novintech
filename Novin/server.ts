import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API proxy route for Bale
  app.post("/api/bale/sendMessage", async (req, res) => {
    try {
      const { botToken, chat_id, text } = req.body;

      if (!botToken || !chat_id || !text) {
        return res.status(400).json({ ok: false, description: "تمامی فیلدهای لازم ارسال نشده‌اند" });
      }

      const baleUrl = `https://tapi.bale.ai/bot${botToken}/sendMessage`;
      const response = await fetch(baleUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id,
          text,
        }),
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error: any) {
      console.error("Bale proxy error:", error);
      return res.status(500).json({ ok: false, description: error.message || "خطای داخلی سرور پروکسی" });
    }
  });

  // API proxy route for Faraz SMS (IPPanel)
  app.post("/api/farazsms/send", async (req, res) => {
    try {
      const { apiKey, sender, patternCode, recipient, values } = req.body;

      if (!apiKey || !sender || !patternCode || !recipient || !values) {
        return res.status(400).json({
          ok: false,
          description: "اطلاعات ارسالی ناقص است. کلیه پارامترها (apiKey, sender, patternCode, recipient, values) الزامی می‌باشند."
        });
      }

      // We send request to FarazSMS/IPPanel API v1 Send Pattern
      const url = "https://api2.ippanel.com/api/v1/sms/pattern/normal/send";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `AccessKey ${apiKey}`,
          "apikey": apiKey
        },
        body: JSON.stringify({
          code: patternCode,
          sender: sender,
          recipient: recipient,
          values: values
        })
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { raw: text };
      }

      if (!response.ok) {
        return res.status(response.status).json({
          ok: false,
          description: `خطا در فراخوانی وب‌سرویس فراز اس‌ام‌اس: ${text}`,
          details: data
        });
      }

      return res.json({ ok: true, data });
    } catch (error: any) {
      console.error("Faraz SMS proxy error:", error);
      return res.status(500).json({
        ok: false,
        description: error.message || "خطای داخلی سرور در ارتباط با وب‌سرویس پیامکی"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
