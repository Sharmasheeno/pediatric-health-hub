const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createContent = async (data) => prisma.educationalContent.create({ data });
const getPublishedContent = async () => prisma.educationalContent.findMany({ where: { isPublished: true, deletedAt: null } });

module.exports = { createContent, getPublishedContent };
