import { createServerFn } from "@tanstack/react-start";
import { db } from "./db";
import { z } from "zod";

export const saveOrder = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: any }) => {
    try {
      const schema = z.object({
        customerName: z.string().min(1),
        customerEmail: z.string().min(1),
        customerPhone: z.string().min(1),
        customerAddress: z.string().min(1),
        items: z.string().min(1),
        total: z.number(),
        instructions: z.string().optional().or(z.literal("")),
        trackingToken: z.string().optional().or(z.literal("")),
      });

      const parsed = schema.parse(data);

      let salespersonId: string | null = null;
      if (parsed.trackingToken && parsed.trackingToken.trim().length > 0) {
        const sp = await db.salesperson.findFirst({
          where: { token: parsed.trackingToken, status: "active" },
          select: { id: true },
        });
        if (sp) salespersonId = sp.id;
      }

      const order = await db.order.create({
        data: {
          customerName: parsed.customerName,
          customerEmail: parsed.customerEmail,
          customerPhone: parsed.customerPhone,
          customerAddress: parsed.customerAddress,
          items: parsed.items,
          instructions: parsed.instructions || null,
          total: parsed.total,
          status: "pending",
          salespersonId,
          trackingToken: parsed.trackingToken || null,
        },
      });

      return { success: true, orderId: order.id };
    } catch (err: any) {
      console.error("saveOrder error:", err?.message || err);
      return { success: false, error: err?.message || "unknown error" };
    }
  },
);

export const trackVisit = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: any }) => {
    try {
      const schema = z.object({
        token: z.string().min(1),
        pageUrl: z.string().optional().or(z.literal("")),
        referrer: z.string().optional().or(z.literal("")),
      });

      const parsed = schema.parse(data);

      const sp = await db.salesperson.findFirst({
        where: { token: parsed.token, status: "active" },
        select: { id: true, token: true },
      });

      if (sp) {
        await db.siteVisit.create({
          data: {
            salespersonId: sp.id,
            token: sp.token,
            pageUrl: parsed.pageUrl || null,
            referrer: parsed.referrer || null,
            userAgent: null,
          },
        });
      }

      return { success: true, found: !!sp };
    } catch (err: any) {
      console.error("trackVisit error:", err?.message || err);
      return { success: false, error: err?.message || "unknown error" };
    }
  },
);
