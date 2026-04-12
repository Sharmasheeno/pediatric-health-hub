const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { successResponse } = require('../utils/responseWrapper');

const getMessages = async (req, res, next) => {
    try {
        const { targetUserId } = req.params;
        const currentUserId = req.user.id;

        const messages = await prisma.directMessage.findMany({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: targetUserId },
                    { senderId: targetUserId, receiverId: currentUserId }
                ]
            },
            orderBy: { createdAt: 'asc' },
            take: 50
        });

        // Mark them as read if target user sent them
        await prisma.directMessage.updateMany({
            where: { senderId: targetUserId, receiverId: currentUserId, isRead: false },
            data: { isRead: true }
        });

        return successResponse(res, messages, "Messages fetched");
    } catch (err) {
        next(err);
    }
};

const sendMessage = async (req, res, next) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;

        const message = await prisma.directMessage.create({
            data: {
                senderId,
                receiverId,
                content
            }
        });

        return successResponse(res, message, "Message sent successfully", 201);
    } catch (err) {
        next(err);
    }
};

const getRecentContacts = async (req, res, next) => {
    try {
        const currentUserId = req.user.id;
        let contacts = [];
        
        if (req.user.role === 'PARENT') {
            // Parents can message any doctor
            const doctors = await prisma.user.findMany({
                where: { role: 'DOCTOR' },
                include: { doctorProfile: true }
            });
            contacts = doctors.map(d => ({
                id: d.id,
                name: `Dr. ${d.doctorProfile?.firstName || ''} ${d.doctorProfile?.lastName || ''}`.trim(),
                role: 'DOCTOR'
            }));
        } else if (req.user.role === 'DOCTOR') {
            // Doctors see ALL parents who have messaged them OR have appointments
            const contactMap = new Map();

            // 1. Find parents who sent direct messages to this doctor
            const incomingMessages = await prisma.directMessage.findMany({
                where: { receiverId: currentUserId },
                select: { senderId: true },
                distinct: ['senderId']
            });

            const senderIds = incomingMessages.map(m => m.senderId);
            
            // Also check outgoing messages from this doctor
            const outgoingMessages = await prisma.directMessage.findMany({
                where: { senderId: currentUserId },
                select: { receiverId: true },
                distinct: ['receiverId']
            });

            const receiverIds = outgoingMessages.map(m => m.receiverId);
            const allMessageUserIds = [...new Set([...senderIds, ...receiverIds])];

            if (allMessageUserIds.length > 0) {
                const messageUsers = await prisma.user.findMany({
                    where: { id: { in: allMessageUserIds }, role: 'PARENT' },
                    include: { parentProfile: true }
                });
                messageUsers.forEach(u => {
                    contactMap.set(u.id, {
                        id: u.id,
                        name: `${u.parentProfile?.firstName || ''} ${u.parentProfile?.lastName || ''} (Parent)`.trim(),
                        role: 'PARENT'
                    });
                });
            }

            // 2. Also add parents from appointments
            const doctorProfile = await prisma.doctorProfile.findUnique({
                where: { userId: currentUserId }
            });

            if (doctorProfile) {
                const apps = await prisma.appointment.findMany({
                    where: { doctorId: doctorProfile.id },
                    include: { child: { include: { parent: { include: { user: true } } } } }
                });
                apps.forEach(a => {
                    if (a.child?.parent?.user && !contactMap.has(a.child.parent.user.id)) {
                        contactMap.set(a.child.parent.user.id, {
                            id: a.child.parent.user.id,
                            name: `${a.child.parent.firstName || ''} ${a.child.parent.lastName || ''} (Parent)`.trim(),
                            role: 'PARENT'
                        });
                    }
                });
            }

            contacts = Array.from(contactMap.values());
        }

        return successResponse(res, contacts, "Contacts fetched");
    } catch (err) {
        next(err);
    }
};

module.exports = { getMessages, sendMessage, getRecentContacts };
