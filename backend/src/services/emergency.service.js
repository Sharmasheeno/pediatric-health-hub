const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createContact = async (data) => prisma.emergencyContact.create({ data });
const getContacts = async () => prisma.emergencyContact.findMany({ where: { deletedAt: null } });

module.exports = { createContact, getContacts };
