import { Resend } from "resend";

const resend = new Resend("re_EKTRfbzz_9dPTFMEx9CtztqXPeVMwokkN");

async function test() {
  try {
    const { data, error } = await resend.emails.send({
      from: "AQ Beds <onboarding@resend.dev>",
      to: ["aqbeds2822@gmail.com"],
      subject: "Test Order Notification",
      html: "<h1>It works!</h1><p>Test email from AQ Beds via Resend to your new address.</p>",
    });

    if (error) {
      console.error("Resend API Error:", JSON.stringify(error, null, 2));
    } else {
      console.log("SUCCESS! Email sent. ID:", data?.id);
    }
  } catch (err) {
    console.error("Fatal error:", err);
  }
}

test();
