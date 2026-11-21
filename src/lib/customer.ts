import { prisma } from "./prisma";

export interface CustomerInput {
  name: string;
  phone: string;
  address: string;
  district: string;
}

/**
 * Reuses an existing customer when the phone matches;
 * updates their latest name, address, and district.
 */
export async function upsertCustomer(input: CustomerInput) {
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      phone: input.phone,
    },
  });

  if (existingCustomer) {
    return prisma.customer.update({
      where: {
        id: existingCustomer.id,
      },
      data: {
        name: input.name,
        address: input.address,
        district: input.district,
      },
    });
  }

  return prisma.customer.create({
    data: {
      name: input.name,
      phone: input.phone,
      address: input.address,
      district: input.district,
    },
  });
}

