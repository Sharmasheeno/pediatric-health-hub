const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createNotification = async (data) => prisma.notification.create({ data });
const getUserNotifications = async (userId) => prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
const markAsRead = async (id) => prisma.notification.update({ where: { id }, data: { isRead: true } });

module.exports = { createNotification, getUserNotifications, markAsRead };
