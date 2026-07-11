const { Resend } = require("resend");

const resend = new Resend("re_BToW6jPy_KcnjZD1rZ5eZ2pawWfbHyAy5");

async function test() {
  try {
    const { data, error } = await resend.emails.send({
      from: "AQ Beds <onboarding@resend.dev>",
      to: ["aqbeds2822@gmail.com"],
      subject: "Test Order Notification - AQ Beds",
      html: "<h1>It works!</h1><p>This is a test email from AQ Beds via Resend.</p>",
    });

    if (error) {
      console.error("Resend API Error:", JSON.stringify(error, null, 2));
    } else {
      console.log("SUCCESS! Email sent. ID:", data && data.id);
    }
  } catch (err) {
    console.error("Fatal error:", err);
  }
}

test();
