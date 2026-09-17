import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const tugasList = await prisma.tugas.findMany({
      where: { deadline: { not: null } }
    });

    let count = 0;
    for (const t of tugasList) {
      const newDeadline = new Date(t.deadline.getTime() - (7 * 60 * 60 * 1000));
      await prisma.tugas.update({
        where: { id: t.id },
        data: { deadline: newDeadline }
      });
      count++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `✅ Berhasil mengalibrasi (memundurkan 7 jam) pada ${count} deadline tugas!` 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
