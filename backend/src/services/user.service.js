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
      select: { id: true, email: true, role: true, isActive: true, createdAt: true }
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

const deleteUser = async (id) => {
  return await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
  });
};

module.exports = { getUsers, getDoctors, createUser, updateUserRole, deleteUser };
