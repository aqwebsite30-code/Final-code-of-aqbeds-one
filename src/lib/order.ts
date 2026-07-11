import { createServerFn } from "@tanstack/react-start";
import { db } from "./db";

export const createOrder = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  try {
    const data = ctx?.data || ctx;
    const { customer, items, total, instructions } = data;

    const order = await db.order.create({
      data: {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerAddress: `${customer.addr1}, ${customer.city}, ${customer.postcode}, ${customer.country || "United Kingdom"}`,
        items: JSON.stringify(items),
        instructions: instructions || null,
        total: parseFloat(total.replace(/[^0-9.]/g, "")),
        status: "pending",
      },
    });

    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return { success: false, error: error.message };
  }
});
