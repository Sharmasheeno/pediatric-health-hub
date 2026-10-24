const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const getUsers = async (page = 1, limit = 10, search = '') => {
  const skip = (page - 1) * limit;
  const where = { deletedAt: null };
  if (search) {
    where.email = { contains: search };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        parentProfile: { select: { id: true } }
      }
    }),
    prisma.user.count({ where })
  ]);

  return { data: users, meta: { total, page, limit, totalPages: Math.ceil(total/limit) } };
};

const getDoctors = async () => {
    return await prisma.doctorProfile.findMany({
        where: { deletedAt: null, user: { deletedAt: null } },
        include: { user: { select: { email: true, isActive: true } } }
    });
};

const createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return await prisma.user.create({
      data: {
          email: data.email,
          password: hashedPassword,
          role: data.role,
          isEmailVerified: true
      },
      select: { id: true, email: true, role: true }
  });
};

const updateUserRole = async (id, role) => {
  return await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true }
  });
};

const createParentProfile = async (userId, data) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, deletedAt: true, parentProfile: { select: { id: true } } }
  });

  if (!user || user.deletedAt) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }
  if (user.role !== 'PARENT') {
    throw Object.assign(new Error('Only parent accounts can receive a parent profile'), { statusCode: 400 });
  }
  if (user.parentProfile) {
    throw Object.assign(new Error('This parent account already has a profile'), { statusCode: 409 });
  }

  return prisma.parentProfile.create({
    data: {
      userId: user.id,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim()
    },
    select: { id: true, userId: true, firstName: true, lastName: true }
  });
};

const deleteUser = async (id) => {
  return await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
  });
};

module.exports = { getUsers, getDoctors, createUser, updateUserRole, createParentProfile, deleteUser };
